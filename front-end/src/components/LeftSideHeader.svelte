<script lang="ts">
  import friendRequestIcon from "../assets/images/friend-request-icon.png"
  import friendRequestIconPending from "../assets/images/friend-request-pending-icon.png";
  import addFriendIcon from "../assets/images/add-friends-transparent-icon.png";
  import keyIcon from "../assets/images/key-icon.jpg";

  import PublicKeysModal from "./PublicKeysModal.svelte";
  import FriendRequestList from "./FriendRequests.svelte";
  import AddFriendModal from "./AddFriendModal.svelte";
  import CheckMail from "./CheckMail.svelte";
  

  let isDropdownOpen = false;
  let additionalClasses = "";
  let friendRequestsNumber = 0;

  function toggleFriendRequestsList() {
    isDropdownOpen = !isDropdownOpen;
    additionalClasses = isDropdownOpen? "show" : "";    
  }
</script>


<nav class="navbar">
  <div class="container-fluid">
      <button type="button" class="btn image-btn" on:click={toggleFriendRequestsList} aria-expanded={isDropdownOpen}>
        {#if friendRequestsNumber === 0}
          <img src={friendRequestIcon} alt="no friend requests" class="img-fluid">
        {:else}
          <img src={friendRequestIconPending} alt="pending friend requests" class="img-fluid">
        {/if}
      </button>
      <FriendRequestList additionalClasses={additionalClasses} bind:friendRequestsNumber={friendRequestsNumber}/>

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
</nav>

<style>
   nav {
    background-color: #ededed;
   }

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