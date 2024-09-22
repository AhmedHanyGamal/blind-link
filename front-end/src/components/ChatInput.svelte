<script>

</script>


<div class="chat_input">
    <textarea
    class="rounded"
      autocomplete="off"
      spellcheck="false"
      id="chat-message"
      placeholder="Type a message"
      rows="1"
      required
    ></textarea>
</div>


<style>
    .chat_input {
        position: relative;
        height: 90px;
        overflow: hidden;
        background: #f0f0f0;
        padding: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        scrollbar-color: #c2bebe #f1f1f1; /* thumb color, track color */
        scrollbar-width:auto; /* scrollbar thickness: auto, thin, none */
    }

    .chat_input textarea {
        width: 100%;
        height: 100%;
        resize: none; /* Prevents manual resizing by the user */
        box-sizing: border-box; /* Includes padding and border in the element's total width and height */
        padding-left: 0.3%;
        padding-right: 0.3%;
        bottom: 0;
        background-color: #f0f0f0;
        color: black;
    }

</style>