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

        statistic_element = document.getElementById('num-today-news');
        statistic_element.innerText = responseJSON.num_today_news;

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

        var container;

        container = document.getElementById('members-container');
        container.innerHTML = "";
        for (let i = 0; i < responseJSON.users.length; i++) {
          // Reset manager information.
          var note_manager = '';
          // Checks if member is manager.
          if (responseJSON.users[i].branch_managed !== null) {
            // Can make more specific using: `(Manages Branch: ${responseJSON.members[i].branch_managed})`;
            note_manager = `(Manager)`;
          }

          // Reset admin information.
          var note_admin = '';
          // Checks if member is admin.
          if (responseJSON.users[i].system_admin === 1) {
            note_admin = `(Admin)`;
          }

          container.innerHTML += `
            <div id="member-${responseJSON.users[i].username}" class="view-members-container">
                <p>
                  <b> ${responseJSON.users[i].first_name} ${responseJSON.users[i].last_name} ${note_admin} ${note_manager} </b>
                  &emsp;
                  (<u>Email:</u> ${responseJSON.users[i].email})
                  &emsp;
                  (<u>Phone:</u> ${responseJSON.users[i].phone_num})
                  <br>
                  <u>Address:</u> ${responseJSON.users[i].postcode}
                  <br>
                  <button onclick="alert_delete_user('${responseJSON.users[i].first_name} ${responseJSON.users[i].last_name}', '${responseJSON.users[i].username}')" class="right button secondary-button manage-button" type="button"> Delete User </button>
                  <button onclick="alert_promote_admin('${responseJSON.users[i].first_name} ${responseJSON.users[i].last_name}', '${responseJSON.users[i].username}')" class="right button primary-button manage-button" type="button"> Promote To Admin </button>
                  <br>
                </p>
            </div>`;
        }
      }
    };

    xhttp.open("GET", "/admin/get_users", true);
    xhttp.send();
  }

  function alert_promote_admin(name, userID) {
    var res = confirm(`Are you sure you want to promote ${name} (${userID}) to a branch manager?`);

    if (res) {
      fetch(`/admin/user/promote/${userID}`, {
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

  function alert_delete_user(name, userID) {
    var res = confirm(`Are you sure you want to delete user ${name} (${userID})?`);

    if (res) {
      fetch(`/admin/user/delete/${userID}`, {
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
          alert('Failed to remove member. This member may be an admin.');
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