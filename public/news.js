// news details
function getNewsDetails(articleID, callback, errorCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/news/id/' + articleID + '/details.json', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                var data = JSON.parse(xhttp.responseText);
                callback(data);
            } else if (xhttp.status == 404) {
                console.error("Article not found");
            } else {
                console.error("Error fetching article");
            }
        }
    };
    xhttp.send();
}

// create news post
function createNews() {
    // get data
    let title = document.getElementById('news-title').value;
    let content = document.getElementById('news-description').value;
    let today = new Date();
    let datePublished = today.toISOString().split('T')[0];
    let image_url = document.getElementById('image_path').innerText; // path to uploaded file
    let publicValue = document.querySelector('input[name="news_privacy"]:checked').value;
    let sendEmail = document.getElementById('news-email-notify').checked;

    // validate data
    if (!title || !content || !datePublished || publicValue === undefined) {
        alert('Please fill all required fields.');
        return;
    }


    submitNews(title, content, datePublished, image_url, publicValue, sendEmail);
}

function submitNews(title, content, datePublished, imageUrl, publicValue, sendEmail) {
    let newsData = {
        title: title,
        content: content,
        datePublished: datePublished,
        image_url: imageUrl,
        public: publicValue,
        sendEmail: sendEmail
    };

    // POST request
    fetch('/manage/news/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            alert('News article created successfully with ID: ' + data.id);
            window.location.href = "/news";
        })
        .catch(error => {
            try {
                let errorMsg = JSON.parse(error.message);
                alert('Failed to create news article: ' + errorMsg.message);
            } catch (e) {
                alert('Failed to create news article: ' + error.message);
            }
        });
}

// delete news post
function deleteNews(articleID) {
    // confirmation to delete
    if (!confirm('Are you sure you want to delete this news article?')) {
        return;
    }

    fetch(`/manage/news/delete/${articleID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (response.ok) {
                // deleted successfully
                const articleContainer = document.getElementById(`article-${articleID}`);
                if (articleContainer) {
                    articleContainer.remove();
                }
                alert('News article deleted successfully');
                window.location.href = "/news";
            } else if (response.status === 403) {
                alert('You do not have permission to delete this news article');
            } else {
                alert('Failed to delete news article');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the news article');
        });
}

function updateNews(articleID) {
    // get details of article
    let title = document.getElementById('news-title').value;
    let content = document.getElementById('news-description').value;
    let today = new Date();
    let datePublished = today.toISOString().split('T')[0];
    let image_url = document.getElementById('image_path').innerText; // path to uploaded file
    let publicValue = document.querySelector('input[name="news_privacy"]:checked').value;
    let sendEmail = document.getElementById('news-email-notify').checked;

    let newsData = {
        title: title,
        content: content,
        datePublished: datePublished,
        image_url: image_url,
        public: publicValue,
        sendEmail: sendEmail
    };

    fetch(`/manage/news/edit/${articleID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsData)
    })
        .then(response => {
            if (response.ok) {
                alert('News article updated successfully!');
                window.location.href = "/news";
            } else {
                throw new Error('Failed to update news article');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating news article');
        });
}