function toggle_hide(object_to_toggle) {
  object_to_toggle.classList.toggle("hide");
}

// function toggle_dropdown_list(dropdownContent) {
//   dropdownContent.classList.toggle("hide");
// }

function toggle_contact_menu() {
  const dropdownContent = document.querySelector(
    ".rightSide .dropdown_content"
  );

  toggle_hide(dropdownContent);
}

function toggle_pending_friend_requests() {
  const dropdownContent = document.querySelector(".leftSide .dropdown_content");

  toggle_hide(dropdownContent);
}

function public_key_viewer() {
  const modal = document.querySelector("#public-key-modal");
  toggle_hide(modal);
}

function friend_request_form_button() {
  const modal = document.querySelector("#add-friend-modal");
  toggle_hide(modal);
}

function change_contact_username_button() {
  const modal = document.querySelector("#change-contact-username-modal");
  toggle_hide(modal);
}

function dont_persist_data() {
  const modal = document.querySelector("#persist-data-modal");
  toggle_hide(modal);
}

async function persist_data() {
  const persistent = await navigator.storage.persist();
  if (persistent) {
    console.log("Congratulations. Data is now persistent");
    const modal = document.querySelector("#persist-data-modal");
    toggle_hide(modal);
  } else {
    console.log(
      "Warning, your data could get deleted by the browser at any moment"
    );
    alert("Warning, your data could get deleted by the browser at any moment");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const dropdownButtonRight = document.querySelector(
    ".rightSide .dropdown_button"
  );
  dropdownButtonRight.addEventListener("click", toggle_contact_menu);

  const dropdownButtonLeft = document.querySelector(
    ".leftSide .dropdown_button"
  );
  dropdownButtonLeft.addEventListener("click", toggle_pending_friend_requests);

  const publicKeyViewer = document.querySelector("#public-key-viewer");
  publicKeyViewer.addEventListener("click", public_key_viewer);

  const publicKeyViewerCloser = document.querySelector(
    "#public-key-modal .modal-close-button"
  );
  publicKeyViewerCloser.addEventListener("click", public_key_viewer);

  const friendRequestFormButton = document.querySelector(
    "#friend-request-form-button"
  );
  friendRequestFormButton.addEventListener("click", friend_request_form_button);

  const changeContactUsernameButton = document.querySelector(
    "#change-contact-username-button"
  );
  changeContactUsernameButton.addEventListener(
    "click",
    change_contact_username_button
  );

  const noPersistentData = document.querySelector("#dont-persist-data");
  noPersistentData.addEventListener("click", dont_persist_data);

  const persistData = document.querySelector("#persist-data");
  persistData.addEventListener("click", persist_data);
});
