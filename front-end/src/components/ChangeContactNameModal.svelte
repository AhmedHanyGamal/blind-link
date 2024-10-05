<script>
    import Modal from "./Modal.svelte";
    import { openDataBase, getObjectStore, updateRecordKey } from "../db/operations";

    export let friendID;
    export let modalID;
    export let isDropdownOpen;

    let form, modalElement;
    let newName;

    const contactsUpdateChannel = new BroadcastChannel("contact_update");
    const updateActiveUserNameChannel = new BroadcastChannel("update_active_user_name");

    function hideModal() {
        const bsModalInstance = bootstrap.Modal.getInstance(modalElement);
        bsModalInstance.hide();
        newName = "";
        form.classList.remove("was-validated");
        isDropdownOpen = false;
    }

    async function changeContactName(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }
        
        const db = await openDataBase("BlindLink");
        const contactsObjectStore = getObjectStore(db, "contacts", "readwrite");
        await updateRecordKey(contactsObjectStore, friendID, {contact_name: newName});

        contactsUpdateChannel.postMessage("update");
        updateActiveUserNameChannel.postMessage(newName);

        hideModal();
    }
</script>


<Modal bind:modalElement id={modalID} title="Change Contact Name" modalClasses="">
    <div slot="body">
        <form bind:this={form} class="needs-validation" novalidate on:submit={changeContactName}>
            <div class="mb-3">
                <label for="new-name" class="form-label">Contact's new name:</label>
                <input 
                bind:value={newName}
                type="text"
                autocomplete="off"
                spellcheck="false"
                id="new-name"
                placeholder="new contact name"
                class="form-control"
                required>

                <div class="invalid-feedback">Please enter a new name for the active contact. If you are satisfied with the current name, then why are you even here? Just press cancel</div>
            </div>

            <button type="button" class="btn btn-secondary" on:click={hideModal}>Cancel</button>
            <button type="submit" class="btn btn-secondary">Change</button>
        </form>
    </div>

    <div slot="footer">
    </div>
</Modal>