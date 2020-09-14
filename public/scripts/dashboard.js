const destinations = [
  'announcement',
  'welcome',
  'teamconfirm',
  'problem',
  'submission',
]

function loadingProcess() {
  changeTab('welcome-toggle')
  removeLoader()
}

function removeLoader() {
  document.getElementById('loader').style.display = 'none'
  document.getElementById('main').style.display = 'flex'
}

function changeTab(id) {
  let redirectDestination = id.slice(0, -7)
  document.getElementById('announcement-toggle').classList.remove('active')
  document.getElementById('welcome-toggle').classList.remove('active')
  document.getElementById('teamconfirm-toggle').classList.remove('active')
  document.getElementById('problem-toggle').classList.remove('active')
  document.getElementById('submission-toggle').classList.remove('active')
  if (redirectDestination === 'announcement') {
    renderAnnouncements()
  }
  if(redirectDestination === 'problem') {
    renderProblems()
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

async function renderAnnouncements() {
  document.getElementById('container-holder').innerHTML = ""
  var xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let recievedData = JSON.parse(this.responseText)
      for (let i = recievedData.length - 1; i >= 0; i--) {
        let news = recievedData[`${i}`].para
        let heading = recievedData[`${i}`].announcementTitle
        let announceDate = recievedData[`${i}`].dateText
        let announceContent = `<div class="card">
                    <h2 class="card-title">
                        ${heading}
                    </h2>
                    <p>
                        ${news}
                    </p>
                    <div class="text-right"> <!-- text-right = text-align: right -->
                        <p>${announceDate}</p>
                    </div>
                    </div>`
        document.getElementById('container-holder').innerHTML += announceContent
      }
    }
  }
  xhttp.open('GET', '/getNews', true)
  xhttp.send()
}

async function renderProblems() {
  document.getElementById(
            'problem-placeholder'
          ).innerHTML = ""
  axios.get('/problems')
  .then(response => {
        response.data.forEach((recievedData) => {
          let announceContent = `<div class="col-12 col-md-6">
                                    <div class="card">
                                      <h2 class="card-title font-weight-bold">
                                        ${recievedData.heading}
                                      </h2>
                                      <p class="text-muted">
                                        ${recievedData.description}
                                      </p>
                                    </div>
                                  </div>`
          document.getElementById(
            'problem-placeholder'
          ).innerHTML += announceContent
        })
  })
}