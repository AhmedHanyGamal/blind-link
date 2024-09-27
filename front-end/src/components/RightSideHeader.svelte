<script>
import threeDotsVerticle from "../assets/images/three-dots-verticle.png";
import ChangeContactNameModal from "./ChangeContactNameModal.svelte";
export let activeContact;
export let additionalClasses = "invisible";

const updateActiveUserNameChannel = new BroadcastChannel("update_active_user_name");
updateActiveUserNameChannel.onmessage = (event) => {activeContact.contact_name = event.data}


let isDropdownOpen = false;
$: dropdownVisibility = isDropdownOpen? "show": "";
function handleDropdown() {
    isDropdownOpen = !isDropdownOpen;
    // dropdownVisibility = isDropdownOpen? "show": "";
}

</script>


<div class="rightSideHeader {additionalClasses}">
    <div class="currentContact">
      <h4>{activeContact.contact_name}</h4>
    </div>

    <button type="button" class="btn dropdown_button" on:click={handleDropdown} aria-expanded={isDropdownOpen}>
      <img src={threeDotsVerticle} alt="verticle dots" class="img-fluid">
    </button>

    <ul class="dropdown-menu position-absolute top-100 mt-0 me-3 end-0 {dropdownVisibility}">
        <!-- {#each friendRequests as friendRequest} -->
        <li class="dropdown-item text-wrap text-break">
            <button type="button" class="btn dropdown_button" data-bs-toggle="modal" data-bs-target="#change-contact-name-modal">
                change contact name
            </button>


            <!-- <strong><p class="mb-1">{friendRequest.friendRequester}:</p></strong>
            <p class="mb-1">{friendRequest.intro_message}</p>
            <button type="button" class="btn btn-outline-success btn-sm" on:click={() => acceptFriendRequest(friendRequest)}>accept</button>
            <button type="button" class="btn btn-outline-danger btn-sm" on:click={() => declineFriendRequest(friendRequest.message_id)}>decline</button> -->
        </li>
        <!-- {/each} -->
    </ul>
    

    <ChangeContactNameModal friendID={activeContact.id} modalID="change-contact-name-modal" bind:isDropdownOpen/>
</div>

<style>
    .rightSideHeader {
        position: relative;
        height: 60px;
        background: #ededed;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 15px;
    }

    .currentContact {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .currentContact h4 {
        font-size: xx-large;
        line-height: 1.2em;
        margin-left: 60px;
        margin-bottom: 0;
        color: black;
    }

    .dropdown_button {
        border-radius: 50%;
        display: flex;
        overflow: hidden;
        height: 35px;
    }

    .dropdown_button:hover {
        transition: all 0.3s;
        background-color: #d8dbdd;
        cursor: pointer;
    }

     img {
        max-height: 100%;
        max-width: 100%;
        width: auto;
        height: auto;
        display: block;
    }

</style>