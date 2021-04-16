<script>
    import { tick } from "svelte";
    import { lists } from "~/store/list";
    import { autoFocusout } from "~/actions/autoFocusout.js";

    let isEditMode = false;
    let title = "";
    let textareaEl;

    function addList() {
        if (title.trim()) {
            lists.add({
                title,
            });
        }

        offEditMode();
    }

    async function onEditMode() {
        isEditMode = true;
        await tick();
        textareaEl && textareaEl.focus();
    }

    function offEditMode() {
        isEditMode = false;
        title = "";
        console.log(isEditMode);
    }
</script>

<div class="create-list">
    {#if isEditMode}
        <div use:autoFocusout={offEditMode} class="edit-mode">
            <textarea
                bind:value={title}
                bind:this={textareaEl}
                placeholder="Enter a title for this list.."
                on:keydown={(event) => {
                    event.key === "Enter" && addList();
                    event.key === "Escape" && offEditMode();
                    event.key === "Esc" && offEditMode();
                }}
            />
            <div class="actions">
                <div class="btn success" on:click={addList}>Add List</div>
                <div class="btn" on:click={offEditMode}>Cancel</div>
            </div>
        </div>
    {:else}
        <div class="add-another-list" on:click={onEditMode}>
            +Add another List
        </div>
    {/if}
</div>

<style lang="scss">
    // @import "../scss/main.scss"
    .create-list {
        white-space: normal;
        font-size: 16px;
        width: 290px;
        display: inline-block;
        padding: 10px 8px;
        vertical-align: top;
        background: rgba(#ebecf0, 0.6);
        border-radius: 4px;
        margin: 0 4px;
        line-height: 20px;
        cursor: pointer;
        transition: 0.2s;
        &:hover {
            background: #ebecf0;
        }
    }
</style>
