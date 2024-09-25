<script>
    import { send_message } from "../logic/CommunicationOperations";
    import { sign_message } from "../logic/CryptoOperations";
    import { getMyKeys, openDataBase, getObjectStore, addIndexedDBEntry } from "../db/operations";

    export let additionalClasses = "invisible";
    export let encryptionPublicKey, verificationPublicKeyBase64;

    let message = "";
    const chatUpdateChannel = new BroadcastChannel("chat_update");
    const contactsUpdateChannel = new BroadcastChannel("contact_update");

    async function sendCommunicationMessage() {
        const myKeys = await getMyKeys();
        const signature = await sign_message(myKeys.signature_private_key, message);
        const data = {messageType: "communication message", message, signature};
        const messageSent = await send_message(data, encryptionPublicKey);

        return messageSent;
    }

    async function addIndexedDBEntryDirectly(databaseName, objectStoreName, data, key = "something_that_would_never_be_a_key", databaseVersion = 1) {
        const db = await openDataBase(databaseName, databaseVersion)
        const objectStore = getObjectStore(db, objectStoreName, "readwrite");
        addIndexedDBEntry(objectStore, data, key);
    }

    async function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey && message.trim() !== "") {
            event.preventDefault();

            const resultMessage = await sendCommunicationMessage();
            
            if (!resultMessage) {
                console.error("error sending message");
                return;
            }

            const newMessage = {id: resultMessage.message_id, message, timestamp: Date.now(), verification_public_key: verificationPublicKeyBase64, messageType: "sent"};
            await addIndexedDBEntryDirectly("BlindLink", "messages", newMessage, newMessage.id);

            message = "";
            chatUpdateChannel.postMessage("update");
            contactsUpdateChannel.postMessage("update");
        }
    }
</script>


<div class="chat_input {additionalClasses}">
    <textarea
    bind:value={message}
    on:keydown={handleKeyDown}
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