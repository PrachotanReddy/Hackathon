const destinations = ['announcement', 'participant', 'scoring', 'problem']
let renderedAnnouncements = 0

function changeTab(id) {
  let redirectDestination = id.slice(0, -7)
  document.getElementById('announcement-toggle').classList.remove('active')
  document.getElementById('participant-toggle').classList.remove('active')
  document.getElementById('scoring-toggle').classList.remove('active')
  document.getElementById('problem-toggle').classList.remove('active')
  if (redirectDestination === 'announcement' && renderedAnnouncements === 0) {
    renderAnnouncements()
    renderedAnnouncements = 1
  }
  for (let i = 0; i < destinations.length; i++) {
    if (destinations[i] == redirectDestination) {
      let sidebarLinkSelection = destinations[i] + '-toggle'
      document.getElementById(`${sidebarLinkSelection}`).classList.add('active')
      document.getElementById(`${destinations[i]}`).style.display = 'flex'
    } else {
      document.getElementById(`${destinations[i]}`).style.display = 'none'
    }
  }
}

function deleteUserDetails(email) {
  const url = `/deleteParticipant?user=${email}`
  fetch(url)
    .then((resp) => resp.text()) // Transform the data into json
    .then(function (data) {
      if (data === 'done') {
        document.getElementById(
          'alertHolder'
        ).innerHTML = `<div class="alert alert-danger" role="alert">
                    <button class="close" data-dismiss="alert" type="button" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="alert-heading">User Deleted</h4>
                    <p>The user ${email} was deleted.</p></div>`
      } else {
        alert('There was an error in deleting the user. Maybe try again?')
      }
    })
}

function renderAnnouncements() {
  let announceContent = ''
  var xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let recievedData = JSON.parse(this.responseText)
      for (let i = recievedData.length - 1; i >= 0; i--) {
        let news = recievedData[`${i}`].para
        let heading = recievedData[`${i}`].announcementTitle
        let buttonID = recievedData[`${i}`]._id
        let announceDate = recievedData[`${i}`].dateText
        let announceContent = `<div class="card">
                                        <h2 class="card-title">${heading}</h2>
                                        <p>${news}</p>
                                        <p>${announceDate}</p>
                                        <bu
                                        </div>
                                        <button class="btn btn-danger" type="button" id='${buttonID}' onclick="deleteAnnouncement(this.id)">Danger</button>`
        document.getElementById(
          'announcement-holder'
        ).innerHTML += announceContent
      }
    }
  }
  xhttp.open('GET', '/getAdminNews', true)
  xhttp.send()
}

function deleteAnnouncement(id) {
  var xhttp = new XMLHttpRequest()
  xhttp.open('DELETE', '/deleteAdminNews/' + id, true)
  xhttp.send()
}

function giveScores(email) {
  let score = document.getElementById(`${email}`).value
  if (!score) {
    score = 0
  }
  const url = `/giveScores?user=${email}&scoreadd=${score}`
  fetch(url)
    .then((resp) => resp.text()) // Transform the data into json
    .then(function (data) {})
  alert('Score was added. Refresh the page to see updates')
}
