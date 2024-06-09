// --- Admin Dashboard ---
function get_site_information() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var responseJSON = JSON.parse(this.responseText);

        console.log(this.responseText);
        console.log(responseJSON);

        var statistic_element;

        statistic_element = document.getElementById('num-site-users');
        statistic_element.innerText = responseJSON.num_site_users;

        statistic_element = document.getElementById('num-upcoming-events');
        statistic_element.innerText = responseJSON.num_upcoming_events;

        statistic_element = document.getElementById('num-total-events');
        statistic_element.innerText = responseJSON.num_total_events;

        statistic_element = document.getElementById('num-total-news');
        statistic_element.innerText = responseJSON.num_total_news;


        statistic_element = document.getElementById('other-admins');
        statistic_element.innerHTML = "";
        for (let i = 0; i < responseJSON.other_admins.length; i++) {
          statistic_element.innerHTML += `
            <div class="dashboard-container">
                <p>
                  <b> ${responseJSON.other_admins[i].first_name} ${responseJSON.other_admins[i].last_name} </b>
                  &emsp;
                  (<u>Email:</u> ${responseJSON.other_admins[i].email})
                  &emsp;
                  (<u>Phone:</u> ${responseJSON.other_admins[i].phone_num})
                </p>
            </div>`;
        }
      }
    };

    xhttp.open("GET", "/admin/site_information", true);
    xhttp.send();
}

// --- View Users ---
function get_users() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var responseJSON = JSON.parse(this.responseText);

        console.log(this.responseText);
        console.log(responseJSON);

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
            <div id="member-${responseJSON.members[i].username}" class="view-members-container">
                <p>
                  <b> ${responseJSON.members[i].first_name} ${responseJSON.members[i].last_name} ${note_manager} </b>
                  &emsp;
                  (<u>Email:</u> ${responseJSON.members[i].email})
                  &emsp;
                  (<u>Phone:</u> ${responseJSON.members[i].phone_num})
                  <br>
                  <u>Address:</u> ${responseJSON.members[i].postcode}
                  <br>
                  <button onclick="alert_remove_member('${responseJSON.members[i].first_name} ${responseJSON.members[i].last_name}', '${responseJSON.members[i].username}')" class="right button secondary-button manage-button" type="button"> Remove Member From Branch </button>
                  <button onclick="alert_promote_manager('${responseJSON.members[i].first_name} ${responseJSON.members[i].last_name}', '${responseJSON.members[i].username}')" class="right button primary-button manage-button" type="button"> Promote To Manager </button>
                  <br>
                </p>
            </div>`;
        }
      }
    };

    var branchID = window.location.pathname.split('/')[4];
    xhttp.open("GET", "/manage/get_members?id=" + branchID, true);
    xhttp.send();
  }

  function alert_promote_manager(name, userID) {
    var res = confirm(`Are you sure you want to promote ${name} (${userID}) to a branch manager?`);

    if (res) {
      fetch(`/manage/user/promote/${userID}`, {
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
        console.error('Error:', error);
        alert('An error occurred while promoting the member');
      });
    }
    else {
      return;
    }
  }

  function alert_remove_member(name, userID) {
    var res = confirm(`Are you sure you want to remove ${name} (${userID}) from this branch?`);

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
        console.error('Error:', error);
        alert('An error occurred while removing the member');
      });
    }
    else {
      return;
    }
}