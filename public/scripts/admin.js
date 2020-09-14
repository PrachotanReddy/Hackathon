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

async function renderAnnouncements() {
  axios.get('/getAdminNews')
  .then(response => {
        response.data.forEach((recievedData) => {
          let news = recievedData.para
          let heading = recievedData.announcementTitle
          let buttonID = recievedData._id
          let announceDate = recievedData.dateText
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
        })
  }).catch(error => console.error('server error'))
  }

async function deleteAnnouncement(id) {
  let url = '/deleteAdminNews/' + id
  const response = await fetch(url, { 
    method: 'DELETE', 
    headers: { 
        'Content-type': 'application/json'
    } 
});
alert('The announcement was deleted. Refresh to see changes.')
}

async function deleteProblem(id) {
    let url = "/problemstatement/delete?id=" + id;
    const response = fetch(url, { 
    method: 'DELETE', 
    headers: { 
        'Content-type': 'application/json'
    } 
});
alert('The problem statement was deleted. Refresh to see changes')
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