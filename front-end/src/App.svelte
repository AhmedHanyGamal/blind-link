<script lang="ts">
  import { initialize_DB } from "./db/db";
  import { base64_to_public_key } from "./logic/KeyGenerator";
  
  import LeftSideHeader from './components/LeftSideHeader.svelte'
  import ContactsList from "./components/ContactsList.svelte";
  import RightSideHeader from "./components/RightSideHeader.svelte";
  import ChatBox from "./components/ChatBox.svelte";
  import ChatInput from "./components/ChatInput.svelte";

  let activeContact = {};
  let activeEncryptionPublicKey;
  let additionalRightSideHeaderClasses = "invisible";
  let additionalChatInputClasses = "invisible";

  async function handleNewActiveUser(event) {
    activeContact = event.detail;
    
    if (activeContact) {
      additionalRightSideHeaderClasses = "";
      additionalChatInputClasses = "";
    }

    activeEncryptionPublicKey = await base64_to_public_key(activeContact.encryption_public_key, "encrypt");
  }

  initialize_DB();
</script>


<main>
  <div class="leftSide">
    <LeftSideHeader />
    <ContactsList on:activate={handleNewActiveUser}/>
  </div>
  <div class="rightSide">
    <RightSideHeader additionalClasses={additionalRightSideHeaderClasses} {activeContact}/>    
    <ChatBox activeFriendVerificationPublicKey={activeContact.verification_public_key}/>
    <ChatInput additionalClasses={additionalChatInputClasses} encryptionPublicKey={activeEncryptionPublicKey} verificationPublicKeyBase64={activeContact.verification_public_key}/>
  </div>
</main>


<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
  }

  :global(body) {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(
      #009688 0%,
      #009688 130px,
      #d9dbd5 130px,
      #d9dbd5 100%
    );
  }

  main {
    position: relative;
    width: 1298px;
    max-width: 100%;
    height: calc(100vh - 40px);
    background: #fff;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06), 0 2px 5px 0 rgba(0, 0, 0, 0.06);
    display: flex;
  }

  .leftSide {
    position: relative;
    flex: 30%;
    background: #fff;
    border-right: 1px solid rgba(0, 0, 0, 0.2);
  }

  .rightSide {
    position: relative;
    flex: 70%;
    background: #e5ddd5;
  }

  .rightSide::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("./assets/images/pattern.png");
    opacity: 0.06;
  }
</style>