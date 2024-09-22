<script lang="ts">
  import friendRequestIcon from "../assets/images/friend-request-icon.png"
  import friendRequestIconPending from "../assets/images/friend-request-pending-icon.png";
  import addFriendIcon from "../assets/images/add-friends-transparent-icon.png";
  import keyIcon from "../assets/images/key-icon.jpg";

  import PublicKeysModal from "./PublicKeysModal.svelte";
  import FriendRequestList from "./friendRequests.svelte";
  import Modal from "./Modal.svelte";

  import { showFriendRequests, showAddFriendForm, showPublicKeys } from "./VisibilityStores";
  import AddFriendModal from "./AddFriendModal.svelte";
  import FriendRequestModal from "./FriendRequestModal.svelte";
  import CheckMail from "./CheckMail.svelte";
  


  // let friendRequestList;
  let isDropdownOpen = false;
  let additionalClasses = "";
  let friendRequestsNumber = 0;

  function toggleFriendRequestsList() {
    isDropdownOpen = !isDropdownOpen;
    additionalClasses = isDropdownOpen? "show" : "";    
  }


  // let modalDecider = 0;
  // let publicKeyModalRef;


  // // function hideModals() {
  // //   showFriendRequests.set(false);
  // //   showAddFriendForm.set(false);
  // //   showPublicKeys.set(false);
  // // }

  // function showModal(modalNum) {
  //   if (modalNum === 0) {
  //     publicKeyModalRef.closeModal();
  //   }
  //   if (modalNum === 3) {
  //     publicKeyModalRef.openModal();
  //   }
  // }

  // showModal(modalDecider);

</script>


<nav class="navbar">
  <div class="container-fluid">

    <!-- <div class="dropdown"> -->
      <button type="button" class="btn image-btn" on:click={toggleFriendRequestsList} aria-expanded={isDropdownOpen}>
        {#if friendRequestsNumber === 0}
          <img src={friendRequestIcon} alt="no friend requests" class="img-fluid">
        {:else}
          <img src={friendRequestIconPending} alt="pending friend requests" class="img-fluid">
        {/if}
      </button>
      <!-- <div class="dropdown-menu"> -->
        <FriendRequestList additionalClasses={additionalClasses} bind:friendRequestsNumber={friendRequestsNumber}/>
      <!-- </div> -->
    <!-- </div> -->



    <button type="button" class="btn image-btn" data-bs-toggle="modal" data-bs-target="#add-friend-modal">
      <img src={addFriendIcon} alt="add friend" class="img-fluid">
    </button>
    <button type="button" class="btn image-btn" data-bs-toggle="modal" data-bs-target="#public-key-modal">
      <img src={keyIcon} alt="public keys" class="img-fluid">
    </button>

    <CheckMail />
  </div>



  <AddFriendModal id="add-friend-modal" />
  <PublicKeysModal id="public-key-modal"/>

  <!-- <Modal id="public-key-modal" title="Your Public Keys">
    <div slot="body">
      <p class="text-wrap">
        Your encryption public key: MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6B7HhNDL6RN0seDdkCvc78H3ZizxGg8/y4vHDOj4cPwJZGiv03yFlm1dw/6v8qRZxUUw8MmR26B1opLPnYx48BMBPvQIWf1x1+1RN4766nA5/BoFZR04FGIThInceQ9p+iMaeblCPR/bH9opGablvKcaCwEF84XcH7YjA3QKQyCsK2edTBQqiPh6QOqEH970hIPWVuDcjhV4FWg9wJotzniBbkjQtd5vOITCA1wckW+jY/u+puS6tku55r4O5zgigxjKTjzKPnAduUYu/MCFk+gJ4OlDhBQFoVeiUKLBqmISwvXCQEVkVxJwcG/YRx3sczrdngFelAE0BBF4HdJFKwIDAQAB
      </p>
      <p>
        Your verification public key: MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEg+uUdG+RU3Mail9aTlWwRsdwH/L/WRB+bsMDANaWgvGbEcT1oaWRoTD48NaP00Tu/QsXCfmKkJALJKoUICZFJQ==
      </p>
    </div>
  </Modal> -->

  <!-- <button class="image-button" on:click={() => {modalDecider == "0"? modalDecider = "1": modalDecider = "0"}}>
    <img src={friendRequestIconPending} alt="friend requests">
  </button>

  <button class="image-button" on:click={() => {modalDecider == "0"? modalDecider = "2": modalDecider = "0"}}>
    <img src={addFriendIcon} alt="add friend">
  </button>

  <button class="image-button" on:click={() => {modalDecider == "0"? modalDecider = "3": modalDecider = "0"}}>
  <img src={keyIcon} alt="public keys">
  </button>

  <button type="button" class="check-mail">Check Mail</button> -->





  <!-- <FriendRequestModal bind:this={} on:close={() => modalDecider = 0}/> -->
  <!-- <AddFriendModal bind:this={} on:close={() => modalDecider = 0}/> -->
  <!-- <PublicKeysModal bind:this={publicKeyModalRef} on:close={() => modalDecider = 0}/> -->
  <!-- <PublicKeysModal id="3"/> -->




  <!-- {#if modalDecider === 1}
    <FriendRequestModal on:close={() => modalDecider = 0}/>
  {:else if modalDecider === 2}
    <AddFriendModal on:close={() => modalDecider = 0}/>
  {:else if modalDecider === 3}
    <p>kinda as expected</p>
    <PublicKeysModal on:close={() => modalDecider = 0}/>
  {/if} -->
</nav>

<style>
  /* .container-fluid {
    justify-content: unset;
  } */
   nav {
    background-color: #ededed;
   }

   /* .btn-light {
    background-color: transparent;
    border: none;
   } */


  .image-btn {
    padding: 0;
    border-radius: 50%;
    overflow: hidden;
    width: 36px;
    height: 36px;
    background-color: transparent;
    border: none;
    margin-right: 4%;
    align-self: flex-start;
    order: 1;
  }

  .image-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .image-btn:hover {
    background-color: #d8dbdd;
  }
</style>






<!-- <div class="leftSideHeader">

  <button class="image-button" on:click={() => {modalDecider == "0"? modalDecider = "1": modalDecider = "0"}}>
    <img src={friendRequestIconPending} alt="friend requests">
  </button>

  <button class="image-button" on:click={() => {modalDecider == "0"? modalDecider = "2": modalDecider = "0"}}>
    <img src={addFriendIcon} alt="add friend">
  </button>

  <button class="image-button" on:click={() => {modalDecider == "0"? modalDecider = "3": modalDecider = "0"}}>
  <img src={keyIcon} alt="public keys">
  </button>

  <button type="button" class="check-mail">Check Mail</button>


  {#if modalDecider == "1"}
    <FriendRequestModal on:close={() => modalDecider = "0"}/>
  {:else if modalDecider == "2"}
    <AddFriendModal on:close={() => modalDecider = "0"}/>
  {:else if modalDecider == "3"}
    <p>kinda as expected</p>
    <PublicKeysModal on:close={() => modalDecider = "0"}/>
  {/if}
</div> -->


<!-- <style>


  .leftSideHeader {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 15px;
    background: #ededed;
    height: 30px;
    /* padding-top: 10px;
    padding-bottom: 10px; */
      /* position: relative; */
  /* width: 100%; */
  /* height: 60px; */
  /* display: flex; */
  /* justify-content: space-between; */
  /* align-items: center; */
  /* padding: 0 15px; */

  }

  .image-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    border-radius: 50%;
    height: 36px;
    object-fit: contain;
    margin-right: 4%;
    align-self: flex-start;
    order: 1;

  }

  .image-button img {
    display: block;
    width: auto; /* Adjust this according to your needs */
    height: 36px; /* Maintain aspect ratio */
  }

  img {
    border-radius: 50%;
    height: 36px;
    object-fit: contain;
    margin-right: 2%;
    align-self: flex-start;
    order: 1;
  }

  img:hover {
    transition: all 0.3s;
    background-color: #d8dbdd;
    cursor: pointer;
  }

  .check-mail {
    padding: 10px 16px;
    border-radius: 15px;
    border-color: black;
    font-size: 14px;
    font-weight: 500;
    background-color: #ededed;
    color: black;

    order: 2;
    margin-left: auto;
    align-self: flex-end;
  }

  .check-mail:hover{
    transition: all 0.3s;
    background-color: #d8dbdd;
    cursor: pointer;
  }

</style> -->
<!-- .image-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.image-button img {
  display: block;
  width: 100%; /* Adjust this according to your needs */
  height: auto; /* Maintain aspect ratio */
}

.image-button:focus {
  outline: none; /* Removes the default focus outline */
} -->

<!-- <button on:click={increment}>
  count is {count}
</button> -->
