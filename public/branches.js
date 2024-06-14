// branch details
function getBranchDetails(branchID, callback, errorCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/branch/id/' + branchID + '/details.json', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                var data = JSON.parse(xhttp.responseText);
                callback(data);
            } else if (xhttp.status == 404) {
                // console.error("Branch not found");
            } else {
                // console.error("Error fetching branch details");
                if (errorCallback) {
                    errorCallback(xhttp.status);
                }
            }
        }
    };
    xhttp.send();
}

function createBranch() {
    // Get data
    let name = document.querySelector('.create-branch-title').value;
    let email = document.querySelector('input[name="branch-email"]').value;
    let phone = document.querySelector('input[name="branch-phone"]').value;
    let streetNumber = document.getElementById('street-number').value;
    let streetName = document.getElementById('street-name').value;
    let city = document.getElementById('city').value;
    let state = document.getElementById('state').value;
    let postcode = document.getElementById('postcode').value;
    let description = document.querySelector('.create-branch-description').value;
    let openingHours = document.getElementById('openingHours').value;
    let closingHours = document.getElementById('closingHours').value;
    let image_url = document.getElementById('image_path').innerText;

    // Validate data
    if (!name || !email || !city || !state || !postcode || !description || !openingHours || !closingHours) {
        alert('Please fill all required fields.');
        return;
    }

    // if (typeof postcode !== "number") {
    //     alert('Incorrect types in one or more fields.');
    //     return;
    // }
    // TODO: handle image upload

    submitBranch(name, email, phone, streetNumber, streetName, city, state, postcode, description, image_url, openingHours, closingHours);
}

function submitBranch(name, email, phone, streetNumber, streetName, city, state, postcode, description, imageUrl, openingHours, closingHours) {
    let branchData = {
        name: name,
        email: email,
        phone: phone,
        streetNumber: streetNumber,
        streetName: streetName,
        city: city,
        state: state,
        postcode: postcode,
        description: description,
        openingHours: openingHours,
        closingHours: closingHours,
        image_url: imageUrl
    };

    // POST request
    fetch('/admin/branch/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            alert('Branch created successfully with ID: ' + data.id);
        })
        .catch(error => {
            try {
                let errorMsg = JSON.parse(error.message);
                alert('Failed to create branch: ' + errorMsg.message);
            } catch (e) {
                alert('Failed to create branch: ' + error.message);
            }
        });
}

function deleteBranch(branchID) {
    // confirmation to delete
    if (!confirm('Are you sure you want to delete this branch?')) {
        return;
    }

    fetch(`/admin/branch/delete/${branchID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (response.ok) {
                // deleted successfully
                const branchContainer = document.getElementById(`branch-${branchID}`);
                if (branchContainer) {
                    branchContainer.remove();
                }
                alert('Branch deleted successfully');
                window.location.href = "/branches";
            } else if (response.status === 403) {
                alert('You do not have permission to delete this branch');
            } else {
                alert('Failed to delete branch');
            }
        })
        .catch(error => {
            // console.error('Error:', error);
            alert('An error occurred while deleting the branch');
        });
}

function updateBranch(branchID) {
    // Get details of branch
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const streetNumber = document.getElementById('streetNumber').value;
    const streetName = document.getElementById('streetName').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const postcode = document.getElementById('postcode').value;
    const description = document.getElementById('description').value;
    const image_url = document.getElementById('image_url').value;
    const closing_time = document.getElementById('closing_hours').value;
    const opening_time = document.getElementById('opening_hours').value;

    const branchDetails = {
        'branch_name': name,
        'email': email,
        'phone': phone,
        'streetNumber': streetNumber,
        'streetName': streetName,
        'city': city,
        'state': state,
        'postcode': postcode,
        'description': description,
        'image_url': image_url,
        'closing_time': closing_time,
        'opening_time': opening_time
    };

    fetch(`/manage/branch/edit/${branchID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchDetails)
    })
        .then(response => {
            if (response.ok) {
                alert('Branch updated successfully!');
            } else {
                throw new Error('Failed to update branch');
            }
        })
        .catch(error => {
            // console.error('Error:', error);
            alert('Error updating branch');
        });
}