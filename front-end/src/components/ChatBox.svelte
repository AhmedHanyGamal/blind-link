<script>

</script>


<div class="chatbox">
    <div class="message my_msg">
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
    </div>
  </div>


  <style>
    .chatbox {
        position: relative;
        height: calc(100% - 150px);
        padding: 50px;
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

  </style>