<script>
    import { cards } from "~/store/list";
    import { tick, createEventDispatcher, onDestroy } from "svelte";
    import { autoFocusout } from "~/actions/autoFocusout";

    export let listId;
    export let card;
    const dispath = createEventDispatcher();
    let isEditMode = false;
    let title;
    let textareaEl;

    function saveCard() {
        if (title.trim()) {
            cards.edit({
                listId,
                cardId: card.id,
                title,
            });
        }
        offEditMode();
    }

    function removeCard() {
        cards.remove({
            listId,
            cardId: card.id,
        });
        offEditMode();
    }

    async function onEditMode() {
        isEditMode = true;
        dispath("editMode", true);
        title = card.title;
        await tick();
        textareaEl && textareaEl.focus();
    }

    function offEditMode() {
        isEditMode = false;
        dispath("editMode", false);
    }
    onDestroy(() => {
        offEditMode();
    });
</script>

<div class="card">
    {#if isEditMode}
        <div use:autoFocusout={offEditMode} class="edit-mode">
            <textarea
                bind:value={title}
                bind:this={textareaEl}
                placeholder="Enter a title for this card..."
                on:keydown={(event) => {
                    event.key === "Enter" && saveCard();
                    event.key === "Escape" && offEditMode();
                    event.key === "Enter" && offEditMode();
                }}
            />
            <div class="actions">
                <div class="btn success" on:click={saveCard}>Save</div>
                <div class="btn" on:click={offEditMode}>Cancel</div>
                <div class="btn danger" on:click={removeCard}>Del Card</div>
            </div>
        </div>
    {:else}
        <div class="title">
            {card.title}
            <div class="btn small" on:click={onEditMode}>Edit</div>
        </div>
    {/if}
</div>

<style lang="scss">
    .card {
        margin-bottom: 8px;
        &:last-child {
            margin-bottom: 1px;
        }
        :global(&.sortable-ghost) {
            opacity: 0.1;
            position: relative;
            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                border-radius: 4px;
            }
        }
        :global(&.sortable-chosen) {
            cursor: move;
        }
        .title {
            background: #fff;
            padding: 6px 8px;
            border-radius: 4px;
            box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
            line-height: 20px;
            position: relative;
            &:hover {
                background: #f5f5f5;
            }
            .btn {
                position: absolute;
                top: 6px;
                right: 8px;
                display: none;
            }
            &:hover .btn {
                display: block;
            }
        }
    }
</style>
