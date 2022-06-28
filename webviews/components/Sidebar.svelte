<script lang="ts">
    const onOpenCodePanel = () => {
        tsvscode.postMessage({ type: "onOpenCodePanel", value: '' });
    }
</script>

<div class="wrapper">
    <h1 class="text-center">Swagger checker</h1>
    <button class="margin-top-20" on:click={() => onOpenCodePanel()}>Open panel</button>
    <button class="margin-top">Refresh info</button>
    <div class="margin-top-20">
        <div class="text-center">Sizes: 300 / 240</div>
        <div class="text-center">Endpoints: 30 / 29</div>
        <div class="text-center">Miss endpoints in second file: 1</div>
        <div class="text-center">Miss endpoints in master file: 0</div>
        <div class="text-center">Confused types: 10</div>
    </div>
</div>

<style>
    .text-center {
        text-align: center;
    }

    .margin-top {
        margin-top: 5px;
    }

    .margin-top-20 {
        margin-top: 20px;
    }
</style>
