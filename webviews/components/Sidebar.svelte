<script lang="ts">
    import type { ISidebarState } from "../../types";
    import { onMount } from "svelte";

    let state: ISidebarState = { mFileSize: 1, sFileSize: 1, mFileEndpointsNumber: 0, sFileEndpointsNumber: 0, sFileMissEndpointsNumber: 0, mFileMissEndpointsNumber: 0, sFileConfusedTypeNumber: 0 };

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

    const onOpenCodePanel = () => {
        tsvscode.postMessage({ type: "onOpenCodePanel", value: "" });
    };
</script>

<div class="wrapper">
    <h2>Swagger checker</h2>
    <div class="margin-top-10"></div>
    <div class="example added">ADDED</div>
    <div class="example removed">REMOVED</div>
    <div class="example changed">CHANGED</div>
    <button class="margin-top-10" on:click={() => onOpenCodePanel()}
        >Open panel</button
    >
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


    .example {
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
    }
</style>
