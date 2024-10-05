<script>
  import { createEventDispatcher } from "svelte";
  import { openDataBase, getObjectStore, getAllRecords, getAllRecordsIndex } from "../db/operations";
  import { formatTime, formatDate, truncateString } from "../logic/DataFormatting";
  
  let contactsWithExtraDetails = [];
  const dispatch = createEventDispatcher();
  const contactsUpdateChannel = new BroadcastChannel("contact_update");
  contactsUpdateChannel.onmessage = async (event) => await getContacts();


async function getContacts() {
  const db = await openDataBase("BlindLink", 1);
  const contactsObjectStore = getObjectStore(db, "contacts", "readonly");
  const allContacts = await getAllRecords(contactsObjectStore);
  const fullContacts = allContacts.filter(contact => contact.friend_status === "friend");
  const messagesObjectStore = getObjectStore(db, "messages", "readonly");

  let contactsTimestamp = [];
  
  for (const fullContact of fullContacts) {
    const messages = await getAllRecordsIndex(messagesObjectStore, "verification_public_key",fullContact.verification_public_key);
    if (messages.length === 0) {
      contactsTimestamp.push({...fullContact, mostRecentMessage:""});
      continue;
    }

    let mostRecentMessage = messages[messages.length - 1];
    contactsTimestamp.push({...fullContact, id: mostRecentMessage.id, mostRecentMessage:mostRecentMessage.message, timestamp: mostRecentMessage.timestamp, messageType: mostRecentMessage.messageType});
  }

  contactsTimestamp.sort((first, second) => second.id - first.id);
  contactsWithExtraDetails = contactsTimestamp;
}


  async function activateContact(event, editedContact) {
    const db = await openDataBase("BlindLink");
    const contactsObjectStore = getObjectStore(db, "contacts", "readonly");
    const contacts = await getAllRecordsIndex(contactsObjectStore, "verification_public_key", editedContact.verification_public_key);

    dispatch('activate', contacts[0]);
  }

  function daysSinceSent(timestamp) {
    const date = new Date(timestamp); 
    const currentDate = new Date(Date.now());

    return currentDate.getDate() - date.getDate();
  }

  getContacts();
</script>

<div class="contacts-list">
  {#each contactsWithExtraDetails as contact}
    <!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events (I will let a front-end guy deal with this stuff isA) -->
    <div class="block" id={contact.id} on:click={(event) => activateContact(event, contact)}>
      <div class="details">
        <div class="listHead">
          <h4>{contact.contact_name}</h4>
          <p class="time">{contact.timestamp? (daysSinceSent(contact.timestamp) > 1? formatDate(contact.timestamp): (daysSinceSent(contact.timestamp) === 0? formatTime(contact.timestamp): "Yesterday")): ""}</p>
        </div>
        <div class="message_p">
          <p>{contact.messageType === "sent"? "You: " : "friend: "}{truncateString(contact.mostRecentMessage, 31, "...")}</p>
        </div>
      </div>
    </div>
  {/each}
</div>


<style>
.contacts-list{
  position: relative;
  height: calc(100% - 110px);
  overflow: auto;
  scrollbar-color: #c2bebe #f1f1f1; /* thumb color, track color */
  scrollbar-width:auto; /* scrollbar thickness: auto, thin, none */
}

.block {
  position: relative;
  /* width: 100%; */
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.active {
  background: #ebebeb;
}

.block:hover {
  background: #f5f5f5;
}

.details {
  position: relative;
  width: 100%;
}

.listHead {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

h4 {
  font-size: 1.1em;
  font-weight: 600;
  color: #111;
  margin: 0;
}

p {
    margin: 0;
}

.block .details .listHead .time {
  font-size: 0.75em;
  color: #aaa;
}

.block .details .listHead .time {
  color: #111;
}

.block.unread .details .listHead .time {
  color: #06d755;
}

.message_p {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message_p p {
  color: #aaa;
  display: -webkit-box;
  font-size: 0.9em;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>