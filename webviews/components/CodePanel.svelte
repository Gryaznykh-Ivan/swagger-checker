<script lang="ts">
    import { AceEditor } from "svelte-ace";
    import "brace/mode/yaml";
    import "brace/theme/tomorrow_night";
    let text = "123";
</script>

<div class="">
    <div class="flex">
        <AceEditor
            width="100%"
            height="100%"
            lang="yaml"
            theme="tomorrow-night"
            value={text}
        />
        <AceEditor
            width="100%"
            height="100%"
            lang="yaml"
            theme="tomorrow-night"
            value={text}
        />
    </div>
</div>


<style>
    .flex {
        display: flex;
        height: 100vh;
    }
</style>