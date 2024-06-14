// --- Manager Dashboard ---
function get_branch_information() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var responseJSON = JSON.parse(this.responseText);

      var statistic_element;

      statistic_element = document.getElementById('branch-name');
      statistic_element.innerText = responseJSON.branch_name;

      statistic_element = document.getElementById('num-branch-members');
      statistic_element.innerText = responseJSON.num_branch_members;

      statistic_element = document.getElementById('num-upcoming-events');
      statistic_element.innerText = responseJSON.num_upcoming_events;

      statistic_element = document.getElementById('num-total-events');
      statistic_element.innerText = responseJSON.num_total_events;

      statistic_element = document.getElementById('upcoming-events');
      statistic_element.innerHTML = "";
      for (let i = 0; i < responseJSON.upcoming_events.length; i++) {
        statistic_element.innerHTML += `
          <div class="dashboard-container">
              <p>
                <a href=/events/id/${responseJSON.upcoming_events[i].event_id}> <b> ${responseJSON.upcoming_events[i].event_name} </b> </a>
                &emsp;
                (<u>Date:</u> ${responseJSON.upcoming_events[i].start_date_time})
              </p>
          </div>`;
      }

      statistic_element = document.getElementById('recent-news');
      statistic_element.innerHTML = "";
      for (let i = 0; i < responseJSON.recent_news.length; i++) {
        statistic_element.innerHTML += `
          <div class="dashboard-container">
              <p>
                <a href=/news/id/${responseJSON.recent_news[i].article_id}> <b> ${responseJSON.recent_news[i].title} </b> </a>
                &emsp;
                (<u>Date:</u> ${responseJSON.recent_news[i].date_published})
              </p>
          </div>`;
      }

      statistic_element = document.getElementById('other-managers');
      statistic_element.innerHTML = "";
      for (let i = 0; i < responseJSON.other_branch_managers.length; i++) {
        statistic_element.innerHTML += `
          <div class="dashboard-container">
              <p>
                <b> ${responseJSON.other_branch_managers[i].first_name} ${responseJSON.other_branch_managers[i].last_name} </b>
                &emsp;
                (<u>Email:</u> ${responseJSON.other_branch_managers[i].email})
                &emsp;
                (<u>Phone:</u> ${responseJSON.other_branch_managers[i].phone_num})
              </p>
          </div>`;
      }
    }
    else if (this.status == 403)  {
      window.location.replace("/");
    }
  };

  var branchID = window.location.pathname.split('/')[4];
  xhttp.open("GET", "/manage/branch_information?id=" + branchID, true);
  xhttp.send();
}

// --- View Members ---
function get_members() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var responseJSON = JSON.parse(this.responseText);

      // console.log(this.responseText);
      // console.log(responseJSON);

      var container;

      container = document.getElementById('branch-name');
      container.innerText = responseJSON.branch_name;

      container = document.getElementById('members-container');
      container.innerHTML = "";
      for (let i = 0; i < responseJSON.members.length; i++) {
        // Reset manager information.
        var note_manager = '';
        // Checks if member is manager.
        if (responseJSON.members[i].branch_managed !== null) {
          // Can make more specific using: `(Manages Branch: ${responseJSON.members[i].branch_managed})`;
          note_manager = `(Manager)`;
        }

        container.innerHTML += `
          <div id="member-${responseJSON.members[i].user_id}" class="view-members-container">
              <p>
                <b> ${responseJSON.members[i].first_name} ${responseJSON.members[i].last_name} ${note_manager} </b>
                &emsp;
                (<u>Email:</u> ${responseJSON.members[i].email})
                &emsp;
                (<u>Phone:</u> ${responseJSON.members[i].phone_num})
                <br>
                <u>Post Code:</u> ${responseJSON.members[i].postcode}
                <br>
                <button onclick="alert_remove_member('${responseJSON.members[i].first_name} ${responseJSON.members[i].last_name}', '${responseJSON.members[i].user_id}')" class="right button secondary-button manage-button" type="button"> Remove Member From Branch </button>
                <button onclick="alert_promote_manager('${responseJSON.members[i].first_name} ${responseJSON.members[i].last_name}', '${responseJSON.members[i].user_id}')" class="right button primary-button manage-button" type="button"> Promote To Manager </button>
                <br>
              </p>
          </div>`;
      }
    }
    else if (this.status == 403)  {
      window.location.replace("/");
    }
  };

  var branchID = window.location.pathname.split('/')[4];
  xhttp.open("GET", "/manage/get_members?id=" + branchID, true);
  xhttp.send();
}

function alert_promote_manager(name, userID) {
  var res = confirm(`Are you sure you want to promote ${name} to a branch manager?`);

  if (res) {
    fetch(`/manage/promote/manager/${userID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (response.ok) {
        // promoted successfully
        location.reload();
        alert('Member promoted successfully!');
      } else if (response.status === 403) {
        alert('You do not have permission to promote this member.');
      } else {
        alert('Failed to promote member.');
      }
    })
    .catch(error => {
      // console.error('Error:', error);
      alert('An error occurred while promoting the member');
    });
  }
  else {
    return;
  }
}

function alert_remove_member(name, userID) {
  var res = confirm(`Are you sure you want to remove ${name} from this branch?`);

  if (res) {
    fetch(`/manage/user/remove/${userID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (response.ok) {
        // deleted successfully
        const eventContainer = document.getElementById(`member-${userID}`);
        if (eventContainer) {
          eventContainer.remove();
        }
        alert('Member removed successfully!');
      } else if (response.status === 403) {
        alert('You do not have permission to remove this member.');
      } else {
        alert('Failed to remove member. This member may be a manager.');
      }
    })
    .catch(error => {
      // console.error('Error:', error);
      alert('An error occurred while removing the member');
    });
  }
  else {
    return;
  }
}