<script>
    import { openDataBase, getObjectStore, getFirstRecord, getAllRecords, deleteAllRecords, updateRecordIndex } from "../db/operations";
    import { send_message } from "../logic/CommunicationOperations";
    import { base64_to_public_key } from "../logic/KeyGenerator";
    import { sign_message } from "../logic/CryptoOperations";

    export let additionalClasses = "";
    export let friendRequestsNumber = 0;
    
    
    let friendRequests = [];

    const friendRequestsUpdateChannel = new BroadcastChannel("friend_request_update");
    friendRequestsUpdateChannel.onmessage = async (event) => await getFriendRequests();
    
    const contactsUpdateChannel = new BroadcastChannel("contact_update");

    async function getFriendRequests() {
        const db = await openDataBase("BlindLink", 1);
        const objectStore = getObjectStore(db, "friendRequests", "readonly");
        friendRequests = await getAllRecords(objectStore);
        
        
        friendRequestsNumber = friendRequests.length;
    }

    async function declineFriendRequest(friendRequestID) {
        const db = await openDataBase("BlindLink", 1);
        const objectStore = getObjectStore(db, "friendRequests", "readwrite");
        deleteAllRecords(objectStore, (record) => record.message_id == friendRequestID)
        await getFriendRequests();
    }

    async function sendFriendRequestAcceptance(friendEncryptionPublicKey) {
        const db = await openDataBase("BlindLink", 1);
        const objectStore = getObjectStore(db, "myKeys", "readonly");
        const myKeys = await getFirstRecord(objectStore);

        const dataToSign = Math.random().toString();
        const signature = await sign_message(myKeys.signature_private_key, dataToSign);
        
        const data = {messageType: "friend request acceptance", verificationPublicKey: myKeys.verification_public_key, signature, signedData: dataToSign};

        const messageSent = await send_message(data, friendEncryptionPublicKey)

        if (!messageSent) {
            console.error("error sending friend request acceptance message");
        }
    }

    async function acceptFriendRequest(friendRequest) {
        const newContact = {
            id: friendRequest.message_id,
            contact_name: friendRequest.friendRequester,
            encryption_public_key: friendRequest.encryption_public_key,
            verification_public_key: friendRequest.verification_public_key,
            friend_status: "friend",
        }

        const db = await openDataBase("BlindLink", 1);
        const contactsObjectStore = getObjectStore(db, "contacts", "readwrite");
        await updateRecordIndex(contactsObjectStore, "verification_public_key", newContact.verification_public_key, {...newContact});

        
        const friendRequestObjectStore = getObjectStore(db, "friendRequests", "readwrite");
        deleteAllRecords(friendRequestObjectStore, (record) => record.verification_public_key == friendRequest.verification_public_key);


        const friendEncryptionPublicKey = await base64_to_public_key(newContact.encryption_public_key, "encrypt")
        await sendFriendRequestAcceptance(friendEncryptionPublicKey)

        getFriendRequests();
        contactsUpdateChannel.postMessage("update")
    }




    getFriendRequests();
</script>


<ul class="dropdown-menu position-absolute top-100 mt-1 start-0 {additionalClasses}">
    {#each friendRequests as friendRequest}
    <li class="dropdown-item text-wrap text-break">
        <strong><p class="mb-1">{friendRequest.friendRequester}:</p></strong>
        <p class="mb-1">{friendRequest.intro_message}</p>
        <button type="button" class="btn btn-outline-success btn-sm" on:click={() => acceptFriendRequest(friendRequest)}>accept</button>
        <button type="button" class="btn btn-outline-danger btn-sm" on:click={() => declineFriendRequest(friendRequest.message_id)}>decline</button>
    </li>
    {/each}
</ul>


<style>
    ul {
        max-width: 400px; 
        max-height: 850px;
        overflow-y: auto;
        overflow-x: hidden;
        /* word-wrap: break-word;
        white-space: normal; */
        background-color: aliceblue;
    }
</style>