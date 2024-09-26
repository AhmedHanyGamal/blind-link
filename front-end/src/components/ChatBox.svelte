<script>
  import { openDataBase, getObjectStore, getAllRecordsIndex } from "../db/operations";
  import { formatDate, formatTime } from "../logic/DataFormatting";
  export let activeFriendVerificationPublicKey;

  let messages = [];
  let previousMessageTimestamp = null;
  let chatboxElement;

const chatUpdateChannel = new BroadcastChannel("chat_update");
chatUpdateChannel.onmessage = async () => await getMessages(activeFriendVerificationPublicKey);

async function getMessages(activeFriendVerificationPublicKey) {
  if (!activeFriendVerificationPublicKey) {
    return;
  }
  previousMessageTimestamp = null;

  const db = await openDataBase("BlindLink", 1);
  const objectStore = getObjectStore(db, "messages", "readonly");
  const ourMessages = await getAllRecordsIndex(objectStore, "verification_public_key",activeFriendVerificationPublicKey);

  // no need to sort, as messages are sorted by id, which is automatically incremented in the back-end

  messages = ourMessages;
  scrollToBottom();
}

function scrollToBottom() {
  setTimeout(() => {
    chatboxElement.scrollTop = chatboxElement.scrollHeight;
  }, 0);
}



function isFirstMessageInDay(timestamp) {
  if (previousMessageTimestamp === null) {
    previousMessageTimestamp = timestamp;
    return true;
  }

  const messageDate = new Date(timestamp);
  const previousMessageDate = new Date(previousMessageTimestamp);

  if (messageDate.getDate() > previousMessageDate.getDate()) {
    previousMessageTimestamp = timestamp;
    return true
  }

  previousMessageTimestamp = timestamp;
  return false;
}

function daysSinceSent(timestamp) {
  const date = new Date(timestamp); 
  const currentDate = new Date(Date.now());

  return currentDate.getDate() - date.getDate();
}

$: getMessages(activeFriendVerificationPublicKey);
</script>


<div class="chatbox" bind:this={chatboxElement}>
  {#each messages as message}
    {#if isFirstMessageInDay(message.timestamp)}
      <div class="date"> {daysSinceSent(message.timestamp) > 1? formatDate(message.timestamp): (daysSinceSent(message.timestamp) === 0? "Today": "Yesterday")} </div>
    {/if}

    <div class="message {message.messageType === "sent"? "my_msg" : "friend_msg"}">
      <p>
        {message.message}
        <br /> <span>
          {formatTime(message.timestamp)}
        </span>
      </p>
    </div>
  {/each}

    <!-- <div class="message my_msg">
      <p>Hi <br /><span>12:18</span></p>
    </div>
    <div class="message friend_msg">
      <p>Hey <br /><span>12:18</span></p>
    </div>
    <div class="message my_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        <br /><span>12:15</span>
      </p>
    </div>
    <div class="message friend_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        <br /><span>12:15</span>
      </p>
    </div>
    <div class="message my_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem
        ipsum dolor sit amet consectetur adipisicing elit. Eaque aliquid
        fugiat accusamus dolore qui vitae ratione optio sunt <br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message friend_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        <br /><span>12:15</span>
      </p>
    </div>
    <div class="message my_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur <br /><span>12:15</span>
      </p>
    </div>
    <div class="message friend_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message my_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message friend_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message my_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message friend_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message my_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message friend_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message my_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div>
    <div class="message friend_msg">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.<br /><span
          >12:15</span
        >
      </p>
    </div> -->
  </div>


  <style>
    .chatbox {
        position: relative;
        height: calc(100% - 150px);
        padding-left: 50px;
        padding-right: 50px;
        overflow-y: auto;
        scrollbar-color: #c2bebe #f1f1f1; /* thumb color, track color */
        scrollbar-width:auto; /* scrollbar thickness: auto, thin, none */
    }

    .message {
        position: relative;
        display: flex;
        width: 100%;
        margin: 5px 0;
        color: black;
    }

    .message p {
        position: relative;
        right: 0;
        text-align: right;
        max-width: 65%;
        padding: 12px;
        background: #dcf8c8;
        border-radius: 10px;
        font-size: 0.9em;
    }

    .message p::before {
        content: "";
        position: absolute;
        top: 0;
        right: -12px;
        width: 20px;
        height: 20px;
        background: linear-gradient(
        135deg,
        #dcf8c6 0%,
        #dcf8c6 50%,
        transparent 50%,
        transparent);
    }

    .message p span {
        display: block;
        margin-top: 5px;
        font-size: 0.85em;
        opacity: 0.5;
    }

    .my_msg {
        justify-content: flex-end;
    }

    .friend_msg {
        justify-content: flex-start;
    }

    .friend_msg p {
        background: #fff;
        text-align: left;
    }

    .message.friend_msg p::before {
        content: "";
        position: absolute;
        top: 0;
        left: -12px;
        width: 20px;
        height: 20px;
        background: linear-gradient(
            225deg,
            #fff 0%,
            #fff 50%,
            transparent 50%,
            transparent
        );
    }

    .date {
      display: inline-block;
      text-align: center;
      margin: 20px auto;
      padding: 5px 15px;
      font-size: 14px;
      color: #555; /* Slightly darker grey for text */
      background-color: #e1e1e1; /* Light grey background for the block */
      border-radius: 12px; /* Rounded corners for the block */
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15); /* Subtle shadow for depth */
      font-weight: bold;
    }
  </style>