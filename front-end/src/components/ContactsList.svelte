<script>

</script>

<div class="contacts-list">
    <div class="block active">
        <div class="details">
          <div class="listHead">
            <h4>Michael Diab Al-Mansori</h4>
            <p class="time">10:56</p>
          </div>
          <div class="message_p">
            <p>How are you doing?</p>
          </div>
        </div>
      </div>

      <div class="block unread">
        <div class="details">
          <div class="listHead">
            <h4>Andre</h4>
            <p class="time">12:34</p>
          </div>
          <div class="message_p">
            <p>I love your youtube videos!</p>
            <b>1</b>
          </div>
        </div>
      </div>

      <div class="block unread">
        <div class="details">
          <div class="listHead">
            <h4>Olivia</h4>
            <p class="time">Yesterday</p>
          </div>
          <div class="message_p">
            <p>I just subscribed to your channel</p>
            <b>2</b>
          </div>
        </div>
      </div>
      <div class="block">
        <div class="details">
          <div class="listHead">
            <h4>Parker</h4>
            <p class="time">Yesterday</p>
          </div>
          <div class="message_p">
            <p>Hey!</p>
          </div>
        </div>
      </div>
      <div class="block">
        <div class="details">
          <div class="listHead">
            <h4>Zoey</h4>
            <p class="time">18/01/2022</p>
          </div>
          <div class="message_p">
            <p>I'll get back to you</p>
          </div>
        </div>
      </div>
</div>



<style>
.contacts-list{
  position: relative;
  height: calc(100% - 110px);
  overflow: auto;
  scrollbar-color: #c2bebe #f1f1f1; /* thumb color, track color */
  scrollbar-width:auto; /* scrollbar thickness: auto, thin, none */
}

.block {
  position: relative;
  /* width: 100%; */
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.block.active {
  background: #ebebeb;
}

.block:hover {
  background: #f5f5f5;
}

.details {
  position: relative;
  width: 100%;
}

.listHead {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

h4 {
  font-size: 1.1em;
  font-weight: 600;
  color: #111;
  margin: 0;
}

p {
    margin: 0;
}

.block .details .listHead .time {
  font-size: 0.75em;
  color: #aaa;
}

.block .details .listHead .time {
  color: #111;
}

.block.unread .details .listHead .time {
  color: #06d755;
}

.message_p {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message_p b {
  background: #06d755;
  color: #fff;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.75rem;
}

.message_p p {
  color: #aaa;
  display: -webkit-box;
  font-size: 0.9em;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>