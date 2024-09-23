<script>
  import { onMount } from "svelte";

  import { openDataBase, getObjectStore, getFirstRecord } from "../db/operations";

  import Modal from "./Modal.svelte";
  export let id;



  let encryptionPublicKey;
  let verificationPublicKey;

  async function getMyKeys() {
    const db = await openDataBase("BlindLink", 1);
    const keysStore = getObjectStore(db, "myKeys", "readonly")
    const myKeys = await getFirstRecord(keysStore);
    return myKeys;
  }

  onMount(async () => {
    const myKeys = await getMyKeys();
    encryptionPublicKey = myKeys.encryption_public_key;
    verificationPublicKey = myKeys.verification_public_key;
  })
</script>


<Modal id={id} title="Your Public Keys">
  <div slot="body">
<p>
  Your encryption public key: {encryptionPublicKey}
</p>
<p>
  Your verification public key: {verificationPublicKey}
</p>

  </div>
</Modal>