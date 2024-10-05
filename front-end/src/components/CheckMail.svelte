<script>
    import { getDecryptionPrivateKey, openDataBase, getObjectStore, addIndexedDBEntry, getAllRecords, updateRecordIndex, deleteAllRecords } from "../db/operations";
    import { base64_to_public_key } from "../logic/KeyGenerator";
    import { decrypt_message, verify_signature } from "../logic/CryptoOperations";

    const friendRequestsUpdateChannel = new BroadcastChannel("friend_request_update");
    const contactsUpdateChannel = new BroadcastChannel("contact_update");
    const chatUpdateChannel = new BroadcastChannel("chat_update");

async function check_mail() {
  const get_options = {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let mostRecentMessageID = localStorage.getItem("most_recent_message_ID");

  // the backend variable should be changed to the domain or ip:port of the deployed backend
  const backend = "127.0.0.1:8080"
  const response = await fetch(
    `http://${backend}/api/get-messages?message_id=${mostRecentMessageID}`,
    get_options
  );

  if (!response.ok) {
    alert(
      "Something went wrong when fetching from the server\n" +
        response.statusText
    );
    return;
  }

  const myDecryptionPrivateKey = await getDecryptionPrivateKey();
  const newMessages = (await response.json()).data;

  if (newMessages.length === 0) {
    console.log("No new messages :3");
    return;
  }

  localStorage.setItem("most_recent_message_ID", newMessages[newMessages.length-1].id + 1);

  let myMail = [];
  
  for (const message of newMessages) {    
    try {
      const decryptedMessage = await decrypt_message(
        message.encrypted_data,
        myDecryptionPrivateKey
      );
  
      if (decryptedMessage) {
        decryptedMessage.timestamp = message.timestamp;
        decryptedMessage.message_id = message.id;
  
        myMail.push(decryptedMessage);
      }
    } catch (error) {
      console.log("Message not intended for you, don't peek :^)");
    }
  }

  for (const mailItem of myMail) {
    const db = await openDataBase("BlindLink", 1);

    if (mailItem.messageType === "friend request") {
      const contactsObjectStore = getObjectStore(db, "contacts", "readonly");
      const alreadyFriends = await getAllRecords(contactsObjectStore, (record) => record.verification_public_key === mailItem.verificationPublicKey);

      if (alreadyFriends.length !== 0 && alreadyFriends[0].friend_status === "friend") {
        continue;
      }

      const {
        message_id,
        name : friendRequester,
        message,
        signature,
        encryptionPublicKey: encryptionPublicKeyBase64,
        verificationPublicKey: verificationPublicKeyBase64,
      } = mailItem;

      const verificationPublicKey = await base64_to_public_key(
        verificationPublicKeyBase64,
        "verify"
      );
      
      const isValidSignature = await verify_signature(
        verificationPublicKey,
        message,
        signature
      );
            
      if (!isValidSignature) {
        continue;
      }
            
      const newFriendRequest = {
        message_id,
        friendRequester,
        encryption_public_key: encryptionPublicKeyBase64,
        verification_public_key: verificationPublicKeyBase64,
        intro_message: message,
      };

      const friendRequestStore = getObjectStore(
        db,
        "friendRequests",
        "readwrite"
      );

      addIndexedDBEntry(
        friendRequestStore,
        newFriendRequest,
        newFriendRequest.message_id
      );
    } else if (mailItem.messageType === "friend request acceptance") {      
      const {verificationPublicKey: verificationPublicKeyBase64, signature, signedData} = mailItem;
      const verificationPublicKey = await base64_to_public_key(verificationPublicKeyBase64, "verify");      

      const isValidSignature = await verify_signature(
        verificationPublicKey,
        signedData,
        signature
      );      

      if (!isValidSignature) {
        continue;
      }
      
      const contactsObjectStore = getObjectStore(db, "contacts", "readwrite");
      await updateRecordIndex(contactsObjectStore, "verification_public_key", verificationPublicKeyBase64, {friend_status: "friend", id:mailItem.message_id});

      const friendRequestObjectStore = getObjectStore(db, "friendRequests", "readwrite");
      deleteAllRecords(friendRequestObjectStore, (record) => record.verification_public_key == verificationPublicKeyBase64);
    } else if (mailItem.messageType === "communication message") {
      const contactsObjectStore = getObjectStore(db, "contacts", "readonly");
      const allContacts = await getAllRecords(contactsObjectStore);
      const {message, signature} = mailItem;

      let messageSender = {};

      for (const contact of allContacts) {
        const verificationPublicKey = await base64_to_public_key(contact.verification_public_key, "verify");
        const isValidSignature = await verify_signature(verificationPublicKey, message, signature);
        
        if (isValidSignature) {
          messageSender = contact;
          break;
        }
      }

      if (!messageSender) {
        continue;
      }

      const newMessage = {id: mailItem.message_id, message, timestamp: mailItem.timestamp, verification_public_key: messageSender.verification_public_key, messageType: "received"};
      const messagesObjectStore = getObjectStore(db, "messages", "readwrite");
      addIndexedDBEntry(messagesObjectStore, newMessage, newMessage.id);
    }
  }
  friendRequestsUpdateChannel.postMessage("update");
  contactsUpdateChannel.postMessage("update");
  chatUpdateChannel.postMessage("update");
}
</script>

<button type="button" class="btn check-mail-btn" on:click={check_mail}>Check Mail</button>

<style>
    .check-mail-btn {
        color: black;
        margin-left: auto;
        order: 2;
    }

    .check-mail-btn:hover {
        background-color: #d8dbdd;
    }
</style>