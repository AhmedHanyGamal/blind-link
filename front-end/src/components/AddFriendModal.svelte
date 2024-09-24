<script>
    import Modal from "./Modal.svelte";
    import { base64_to_public_key, is_valid_public_key_base64 } from "../logic/KeyGenerator";
    import { openDataBase, getObjectStore, getMyKeys, addIndexedDBEntry } from "../db/operations";
    import { sign_message } from "../logic/CryptoOperations";
    import { send_message } from "../logic/CommunicationOperations";
    export let id;

    let form, modalElement;
    let friendName, yourName, friendEncryptionPublicKeyBase64, friendVerificationPublicKeyBase64, introMessage;

    async function addNewContact(friendName, friendEncryptionPublicKeyBase64, friendVerificationPublicKeyBase64) {
        const newContact = {
            friend_status: "pending",
            contact_name: friendName,
            encryption_public_key: friendEncryptionPublicKeyBase64,
            verification_public_key: friendVerificationPublicKeyBase64,
        };

        const db = await openDataBase("BlindLink", 1);
        const myContactsStore = getObjectStore(db, "contacts", "readwrite");
        addIndexedDBEntry(myContactsStore, newContact);
    }

    function hideModal() {
      const bsModalInstance = bootstrap.Modal.getInstance(modalElement);
      bsModalInstance.hide();
      friendName = yourName = friendEncryptionPublicKeyBase64 = friendVerificationPublicKeyBase64 = introMessage = ""
      form.classList.remove('was-validated');
    }


    async function sendFriendRequest(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        if (!(await is_valid_public_key_base64(friendEncryptionPublicKeyBase64, "encrypt")) || !(await is_valid_public_key_base64(friendVerificationPublicKeyBase64, "verify"))) {
            //make some front-end magic
            alert("Some or all of the public keys provided are invalid\nPlease provide valid public keys");            
            return;
        }


        const friendEncryptionPublicKey = await base64_to_public_key(
            friendEncryptionPublicKeyBase64,
            "encrypt"
        );

        const myKeys = await getMyKeys();
        const { encryption_public_key: myEncryptionPublicKey, verification_public_key: myVerificationPublicKey, signature_private_key: mySignaturePrivateKey } = myKeys;
        
        const signature = await sign_message(
            mySignaturePrivateKey,
            introMessage
        );

        const data = {
            messageType: "friend request",
            name: yourName,
            message: introMessage,
            signature,
            encryptionPublicKey: myEncryptionPublicKey,
            verificationPublicKey: myVerificationPublicKey,
        };

        const messageSuccessfullySent = await send_message(data, friendEncryptionPublicKey);

        if (!messageSuccessfullySent) {
            alert("the encrypt_data function probably has a chunk size that is too big, use a smaller chunk size.\nIf you don't know what that means, contact someone who does, but no one should even see this alert in the first place :^)")
            return;
        }
        
        
        await addNewContact(friendName, friendEncryptionPublicKeyBase64, friendVerificationPublicKeyBase64);
        hideModal()
    }
</script>


<Modal bind:modalElement {id} title="Add a Friend" modalClasses="modal-lg">
    <div slot="body">
        <form bind:this={form} class="needs-validation" novalidate on:submit={sendFriendRequest}>
            <div class="mb-3">
                <label for="friend-name" class="form-label">Friend's saved name:</label>
                <input
                bind:value={friendName}
                type="text"
                autocomplete="off"
                spellcheck="false"
                id="friend-name"
                placeholder="Reyad El-Bantalouny"
                class="form-control"
                required/>

                <div class="invalid-feedback">Please fill out this field, give the person a name that you can know him by.</div>            
            </div>

            <div class="mb-3">
                <label for="your-name" class="form-label">Your name:</label>
                <input 
                bind:value={yourName}
                type="text"
                autocomplete="off"
                spellcheck="false"
                id="your-name"
                placeholder="Mahmoud El-Samannoudy"
                class="form-control"
                required/>

                <div class="invalid-feedback">Please fill out this field, give us the name that you wish to be called by by your friend</div>
            </div>
  

            <div class="mb-3">
              <label for="friend-encryption-public-key" class="form-label">friend's encryption public key:</label>
              <textarea 
              bind:value={friendEncryptionPublicKeyBase64}
              id="friend-encryption-public-key"
              autocomplete="off" 
              rows="5"
              spellcheck="false"
              placeholder="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtjhau5i0TKS0Gzm7qRIAoEOMJARdCUOff255xgcSvhos/J1LuQNmJkjLE18TTNIQt5YXtuo3wyVjCP1hGaTKLJNVoLK3Pgw9EzkpqBY2jF++zINleHFpbVQxlb0vaEOG+EfN0NcvaD7buG+JclBUPH4AgzQ/9fRPrxoHIf42tGykZ4Dgfcp1gvTPRONzaiBJdpH+FQnSDVBRG3rsd/pi+DcA1DTwz16HBH93WCizn2778qEOafG55MyD4SWcryjnrUEz36zoePf8D/7hp02yyqwTM+Y9JursxljQduYauLC0IgPwxqwTxC17r0nvGZMwYmngwi/D0k4zgkkySZDe9QIDAQAB"
              required 
              class="form-control"></textarea>
              <div class="invalid-feedback">Please enter your friend's encryption public key.</div>          
            </div>

            <div class="mb-3">
                <label for="friend-verification-public-key" class="form-label">friend's verification public key:</label>
                <textarea 
                bind:value={friendVerificationPublicKeyBase64}
                id="friend-verification-public-key"
                autocomplete="off" 
                rows="2"
                spellcheck="false"
                placeholder="MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEVKWe6awuDcielsg22UNgqz3Q8JdDTX8YyN5YbnUYkXS3VlXiQ1u7SPeVJ303bZgT2eEndC1KvguzBg97dz4Fxg=="
                required 
                class="form-control"></textarea>
              <div class="invalid-feedback">Please enter your friend's verification public key.</div>          
            </div>

            <div class="mb-3">
                <label for="intro-message" class="form-label">introductory message:</label>
                <textarea 
                bind:value={introMessage}
                id="intro-message"
                autocomplete="off" 
                rows="3"
                spellcheck="false"
                placeholder="Hello Reyad, this is Mahmoud El-Samannoudy. accept this friend request."
                required 
                class="form-control"></textarea>
              <div class="invalid-feedback">Please write an introduction message so that your friend can know who you are and accept/decline you friend request.</div>          
            </div>

            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-secondary">Send</button>
        </form>  
    </div>

    <div slot="footer">
    </div>
</Modal>

<style>
    textarea {
        resize: none;
    }
</style>