<script lang="ts">
    import type { ISidebarState } from "../../types";
    import { onMount } from "svelte";

    let mFilePath = "";
    let sFilePath = "";

    let state: ISidebarState = {
        mFileSize: 0,
        sFileSize: 0,
        mFileEndpointsNumber: 0,
        sFileEndpointsNumber: 0,
        sFileMissEndpointsNumber: 0,
        mFileMissEndpointsNumber: 0,
        sFileConfusedTypeNumber: 0,
    };

    onMount(async () => {
        window.addEventListener("message", async (event) => {
            const message = event.data;
            switch (message.type) {
                case "new-data-received":
                    state = { ...state, ...message.value };
                    break;
            }
        });
    });

    const onFileSelected = (e: any) => {
        switch (e.target.name) {
            case "mFilePath":
                mFilePath = e.target.files[0].path || "";
                break;
            case "sFilePath":
                sFilePath = e.target.files[0].path || "";
                break;
        }

        e.target.value = null;
    };

    const onOpenCodePanel = async () => {
        tsvscode.postMessage({ type: "onOpenCodePanel", value: { mFilePath, sFilePath }});
    };
</script>

<div class="wrapper">
    <h2>Swagger checker</h2>
    <div class="margin-top-10">
        <div class="fileSearch">
            <input type="text" id="mFilePath" placeholder="File path or link for master" bind:value={mFilePath} />
            <label for="mFilePicker">
                <svg class="searchIcon" viewBox="0 0 183.792 183.792">
                    <path
                        d="M54.734,9.053C39.12,18.067,27.95,32.624,23.284,50.039c-4.667,17.415-2.271,35.606,6.743,51.22
    c12.023,20.823,34.441,33.759,58.508,33.759c7.599,0,15.139-1.308,22.287-3.818l30.364,52.592l21.65-12.5l-30.359-52.583
    c10.255-8.774,17.638-20.411,21.207-33.73c4.666-17.415,2.27-35.605-6.744-51.22C134.918,12.936,112.499,0,88.433,0
    C76.645,0,64.992,3.13,54.734,9.053z M125.29,46.259c5.676,9.831,7.184,21.285,4.246,32.25c-2.938,10.965-9.971,20.13-19.802,25.806
    c-6.462,3.731-13.793,5.703-21.199,5.703c-15.163,0-29.286-8.146-36.857-21.259c-5.676-9.831-7.184-21.284-4.245-32.25
    c2.938-10.965,9.971-20.13,19.802-25.807C73.696,26.972,81.027,25,88.433,25C103.597,25,117.719,33.146,125.29,46.259z" fill="white"/>
                </svg>
                <input type="file" id="mFilePicker" name="mFilePath" on:change={onFileSelected}/>
            </label>
        </div>
    </div>
    <div class="margin-top-10">
        <div class="fileSearch">
            <input type="text" id="sFilePath" placeholder="File path or link for second file" bind:value={sFilePath} />
            <label for="sFilePicker">
                <svg class="searchIcon" viewBox="0 0 183.792 183.792">
                    <path
                        d="M54.734,9.053C39.12,18.067,27.95,32.624,23.284,50.039c-4.667,17.415-2.271,35.606,6.743,51.22
    c12.023,20.823,34.441,33.759,58.508,33.759c7.599,0,15.139-1.308,22.287-3.818l30.364,52.592l21.65-12.5l-30.359-52.583
    c10.255-8.774,17.638-20.411,21.207-33.73c4.666-17.415,2.27-35.605-6.744-51.22C134.918,12.936,112.499,0,88.433,0
    C76.645,0,64.992,3.13,54.734,9.053z M125.29,46.259c5.676,9.831,7.184,21.285,4.246,32.25c-2.938,10.965-9.971,20.13-19.802,25.806
    c-6.462,3.731-13.793,5.703-21.199,5.703c-15.163,0-29.286-8.146-36.857-21.259c-5.676-9.831-7.184-21.284-4.245-32.25
    c2.938-10.965,9.971-20.13,19.802-25.807C73.696,26.972,81.027,25,88.433,25C103.597,25,117.719,33.146,125.29,46.259z" fill="white"/>
                </svg>
                <input type="file" id="sFilePicker" name="sFilePath" on:change={onFileSelected} />
            </label>
        </div>
    </div>
    <button class="margin-top-10" on:click={() => onOpenCodePanel()}>Open panel</button
    >
    <!-- <div class="margin-top-10" />
    <div class="example added">ADDED</div>
    <div class="example removed">REMOVED</div>
    <div class="example changed">CHANGED</div> -->
    <div class="margin-top-10">
        <div class="text">
            Sizes: {state.mFileSize} / {state.sFileSize}
        </div>
        <div class="text">
            Endpoints: {state.mFileEndpointsNumber} / {state.sFileEndpointsNumber}
        </div>
        <div class="text">
            Miss endpoints s. file: {state.sFileMissEndpointsNumber}
        </div>
        <div class="text">
            Miss endpoints m. file: {state.mFileMissEndpointsNumber}
        </div>
        <div class="text">
            Confused types: {state.sFileConfusedTypeNumber}
        </div>
    </div>
</div>

<style>
    .text {
        font-size: 14px;
    }

    .margin-top-10 {
        margin-top: 10px;
    }

    /* .example {
        display: flex;
        font-size: 12px;
        font-weight: 500;
        align-items: center;
        justify-content: center;
        height: 25px;
    }

    .changed {
        background: #ffffff38;
    }
    .removed {
        background: #ff000038;
    }
    .added {
        background: #04ff0038;
    } */

    .searchIcon {
        cursor: pointer;
        width: 26px;
        padding: 5px;
        box-sizing: border-box;
    }

    .fileSearch {
        display: flex;
        justify-items: center;
        align-items: center;
    }

    #mFilePicker, #sFilePicker {
        display: none;
    }
</style>
