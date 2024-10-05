<script>
    export let id;
    export let title;
    export let modalClasses = "";

    let actualModalElement;
    const titleId = Math.random().toString();

    export {actualModalElement as modalElement}
</script>


<div bind:this={actualModalElement} {id} class="modal fade text-break {modalClasses}" tabindex="-1" aria-labelledby={titleId} aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5 text-center w-100" id={titleId}>{title}</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer justify-content-center">
            <slot name="footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </slot>
        </div>
      </div>
    </div>
  </div>