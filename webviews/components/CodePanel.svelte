<script lang="ts">
    import type { DiffJson, DiffObjest } from '../../types'
    import { onMount } from "svelte";
    import { AceEditor, Editor } from "svelte-ace";
    import ace from "brace"
    import "brace/mode/yaml"
    import "brace/theme/tomorrow_night"

    ace.Range = ace.acequire("ace/range").Range;

    let mCode = "";
    let sCode = "";

    let mEditor: Editor;
    let sEditor: Editor;

    let mMarkers: number[] = [];
    let sMarkers: number[] = [];

    const onMasterDocumentChange = (obj: CustomEvent<any>) => {
        mCode = obj.detail;
        tsvscode.postMessage({type: 'onCodeChanged', value: { mCode, sCode }});
    }
    
    const onSecondDocumentChange = (obj: CustomEvent<any>) => {
        sCode = obj.detail;
        tsvscode.postMessage({type: 'onCodeChanged', value: { mCode, sCode }});
    }

    const onClear = () => {
        if (mMarkers.length === 0 && sMarkers.length === 0) return;

        mMarkers.forEach(marker => mEditor.getSession().removeMarker(marker));
        sMarkers.forEach(marker => sEditor.getSession().removeMarker(marker));
    }

    const isPathExist = (LinesArray: Array<string>, path: string): number => {
        let result = -1;

        const tree = path.split(".");
        let index = 0;
        for (let key of tree) {
            let control = false;
            
            let space = result !== -1 ? LinesArray[result === -1 ? 0 : result].match(/  /g)?.length || 0 : -1;
            if (isNaN(+key) === true || tree[index - 1] === "responses") {
                for (let i = result === -1 ? 0 : result + 1; i < LinesArray.length; i++) {

                    if (LinesArray[i].indexOf(key + ":") !== -1) {
                        result = i;
                        break;
                    }

                    const newSpace = LinesArray[i].match(/  /g)?.length || 0;
                    if (newSpace <= space) {
                        control = true;
                        break;
                    }

                }
            } else {
                const number = +key + 1;
                for (let i = result === -1 ? 0 : result + 1, j = 0; i < LinesArray.length && j < number; i++) {
                    
                    if (LinesArray[i].indexOf("-") != -1) {
                        result = result === i ? result + 1 : i;
                        j += 1;
                    }
                    
                    const newSpace = LinesArray[i].match(/  /g)?.length || 0;
                    if (newSpace < space) {
                        control = true;
                        break;
                    }

                }
            }

            if (control === true) {
                result = -1;
                break;
            }

            index += 1;
        }

        return result;
    }

    const getStringNumber = (LinesArray: Array<string>, path: string): number => {
        let result = -1;

        const tree = path.split(".");
        let index = 0;
        for (let key of tree) {
            let control = false;
            
            let space = LinesArray[result === -1 ? 0 : result].match(/  /g)?.length || 0;
            if (isNaN(+key) === true || tree[index - 1] === "responses") {
                for (let i = result === -1 ? 0 : result; i < LinesArray.length; i++) {

                    if (LinesArray[i].indexOf(key + ":") !== -1) {
                        result = i;
                        break;
                    }

                    const newSpace = LinesArray[i].match(/  /g)?.length || 0;
                    if (newSpace < space) {
                        control = true;
                        break;
                    }

                }
            } else {
                const number = +key + 1;
                for (let i = result === -1 ? 0 : result, j = 0; i < LinesArray.length && j < number; i++) {
                    
                    if (LinesArray[i].indexOf("-") != -1) {
                        result = result === i ? result + 1 : i;
                        j += 1;
                    }
                    
                    const newSpace = LinesArray[i].match(/  /g)?.length || 0;
                    if (newSpace < space) {
                        control = true;
                        break;
                    }

                }
            }

            if (control === true) {
                result = -1;
                break;
            }

            index += 1;
        }

        return result;
    }

    const getFirstNonExistPath = (LinesArray: Array<string>, path: string) => {
        let result = '';
        let stringNumber = -1;

        for (let a of path.split(".")) {
            result += result.length === 0 ? a : `.${ a }`;

            const stringNumberTest = isPathExist(LinesArray, result);
            if (stringNumberTest === -1) break;

            if (stringNumber === stringNumberTest) {
                break;
            }

            stringNumber = stringNumberTest;
        }

        return result;
    }

    const onDraw = (data: DiffJson) => {
        if (!mEditor || !sEditor) return;
        

        onClear();

        const mLinesArray = mCode.split('\n');
        const sLinesArray = sCode.split('\n');

        if (data.replace.length > 0) {
            data.replace.forEach(a => {
                const mFileMarker = getStringNumber(mLinesArray, a.path);
                const sFileMarker = getStringNumber(sLinesArray, a.path);

                mMarkers.push(mEditor.getSession().addMarker(new ace.Range(mFileMarker, 0, mFileMarker, 144), "ace-replaced-highlight", "fullLine", true));
                sMarkers.push(sEditor.getSession().addMarker(new ace.Range(sFileMarker, 0, sFileMarker, 144), "ace-replaced-highlight", "fullLine", true));
            });
        }

        while (data.delete.length > 0) {
            const path = data.delete[0].path;
            const firstNonExistPath = getFirstNonExistPath(sLinesArray, path);

            if (path === firstNonExistPath) {
                data.delete.splice(data.delete.findIndex(item => item.path === path), 1);

                const mFileMarker = getStringNumber(mLinesArray, firstNonExistPath);
                mMarkers.push(mEditor.getSession().addMarker(new ace.Range(mFileMarker, 0, mFileMarker, 144), "ace-deleted-highlight", "fullLine", true));
            } else {
                let nextElemIndex = data.delete.findIndex(item => item.path.indexOf(firstNonExistPath) !== -1);
                let nextElemPath = data.delete[nextElemIndex].path;

                
                while (nextElemIndex !== -1) {
                    data.delete.splice(nextElemIndex, 1);
                    
                    nextElemIndex = data.delete.findIndex(item => item.path.indexOf(firstNonExistPath) !== -1);
                    if (nextElemIndex !== -1) nextElemPath = data.delete[nextElemIndex].path;
                }
                
                const mFileMarkerStart = getStringNumber(mLinesArray, firstNonExistPath);
                const mFileMarkerEnd = getStringNumber(mLinesArray, nextElemPath);
                mMarkers.push(mEditor.getSession().addMarker(new ace.Range(mFileMarkerStart, 0, mFileMarkerEnd, 144), "ace-deleted-highlight", "fullLine", true));
            }
        }

        while (data.add.length > 0) {
            const path = data.add[0].path;
            const firstNonExistPath = getFirstNonExistPath(mLinesArray, path);

            if (path === firstNonExistPath) {
                data.add.splice(data.add.findIndex(item => item.path === path), 1);

                const sFileMarker = getStringNumber(sLinesArray, firstNonExistPath);
                sMarkers.push(sEditor.getSession().addMarker(new ace.Range(sFileMarker, 0, sFileMarker, 144), "ace-added-highlight", "fullLine", true));
            } else {
                let nextElemIndex = data.add.findIndex(item => item.path.indexOf(firstNonExistPath) !== -1);
                let nextElemPath = data.add[nextElemIndex].path;

                while (nextElemIndex !== -1) {
                    data.add.splice(nextElemIndex, 1);

                    nextElemIndex = data.add.findIndex(item => item.path.indexOf(firstNonExistPath) !== -1);
                    if (nextElemIndex !== -1) nextElemPath = data.add[nextElemIndex].path;
                }

                const sFileMarkerStart = getStringNumber(sLinesArray, firstNonExistPath);
                const sFileMarkerEnd = getStringNumber(sLinesArray, nextElemPath);
                sMarkers.push(sEditor.getSession().addMarker(new ace.Range(sFileMarkerStart, 0, sFileMarkerEnd, 144), "ace-added-highlight", "fullLine", true));
            }
        }
    }

    onMount(async () => {
        window.addEventListener("message", async (event) => {
            const message = event.data;
            switch (message.type) {
                case "draw":
                    onDraw(message.value);
                    break;
            }
        });

    });

</script>

<div class="">
    <div class="flex">
        <AceEditor
            on:init={ (editor) => mEditor = editor.detail }
            on:input={onMasterDocumentChange}
            width="100%"
            height="100%"
            lang="yaml"
            theme="tomorrow_night"
            value={mCode}
        />
        <AceEditor
            on:init={ (editor) => sEditor = editor.detail }
            on:input={onSecondDocumentChange}
            width="100%"
            height="100%"
            lang="yaml"
            theme="tomorrow_night"
            value={sCode}
        />
    </div>
</div>


<style>
    .flex {
        display: flex;
        height: 99.2vh;
    }
</style>