<script>
import threeDotsVerticle from "../assets/images/three-dots-verticle.png";
</script>


<div class="rightSideHeader">
    <div class="currentContact">
      <h4>Michael Diab Al-Mansori<br /></h4>
    </div>

    <div class="dropdown_button">
      <img src={threeDotsVerticle} alt="verticle dots">
    </div>
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