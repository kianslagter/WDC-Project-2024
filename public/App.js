const { createApp, ref } = Vue;

createApp({
    data() {
        return {
            access_level: null,    // 0 for visitor, 1 for user, 2 for manager, 3 for admin
            manages: null,
            message: 'Hello Vue!',
            events_results: [],
            show_events_filters: false,
            branches_results: null,
            event_selected: null, // set to null intially in real thing
            news_results: [],
            news_array: [],
            news_array1: [],
            article_selected: null,
            num_points: 1,
            point_level: [0],
            branch_selected: null,
            branches: [],
            profile: {
                id: '',
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                phone_num: '',
                postcode: '',
                description: '',
                image_url: '',
                email_notifications: ''
            }, // returns profile information for profile_page.html
            eventInfo: {
                event_id: null,
                branch_id: null,
                event_name: '',
                start_date_time: '',
                end_date_time: '',
                event_description: '',
                event_details: [],
                event_location: '',
                event_image: '',
                is_public: 1,
                branch: '',
                location: ''
            }, // info for event data
            newsInfo: {
                article_id: '',
                branch_id: '',
                branch_name: '',
                title: '',
                date_published: '',
                is_public: '',
                content: '',
                image_url: ''
            },// info for news data
            loading: true,
            event: null,
            isLoading: false,
            error: null,
            image_path: '/image/10',
            images: [
                {
                    'description': 'Food Truck',
                    'path': '/image/2'
                },
                {
                    'description': 'Gardening',
                    'path': '/image/3'
                },
                {
                    'description': 'Handing out Food',
                    'path': '/image/4'
                },
                {
                    'description': 'Packing Boxes',
                    'path': '/image/5'
                },
                {
                    'description': 'People with Box',
                    'path': '/image/7'
                },
                {
                    'description': 'Potatoes',
                    'path': '/image/8'
                },
                {
                    'description': 'Sausage Sizzle',
                    'path': '/image/9'
                },
                {
                    'description': 'Volunteers',
                    'path': '/image/10'
                }
            ]
        };
    },
    setup() {
        const event_selected = ref(null);
        const article_selected = ref(null);
        const branch_selected = ref(null);
        const loading = ref(true);
        // call getEventDetails if the page is on an events details page
        let eventID = window.location.pathname.split('/')[3];

        if (eventID && window.location.pathname.split('/')[1] == 'events') {
            getEventDetails(eventID, function (data) {
                event_selected.value = data;
                loading.value = false;
            });

            return {
                event_selected,
                loading,
            };
        }

        // call getNewsDetails if the page is on an news details page
        let articleID = window.location.pathname.split('/')[3];

        if (articleID && window.location.pathname.split('/')[1] == 'news') {
            getNewsDetails(articleID, function (data) {
                article_selected.value = data;
                loading.value = false;
            });

            return {
                article_selected,
                loading,
            };
        }
        // call getBranchDetails if the page is on an branch details page
        let branchID = window.location.pathname.split('/')[3];

        if (branchID && window.location.pathname.split('/')[1] == 'branches') {
            getBranchDetails(branchID, function (data) {
                branch_selected.value = data;
                loading.value = false;
            });

            return {
                branch_selected,
                loading,
            };
        }
    },
    computed: {
        navitems() {
            const common_nav = [
                { title: 'Meal Mates', url: '/', alignClass: "lobster-regular" },
                { title: 'Events', url: '/events', alignClass: null },
                { title: 'News', url: '/news', alignClass: null },
                { title: 'Branches', url: '/branches', alignClass: null }
            ];

            // logged in
            if (this.profile.email) {
                common_nav.push({ title: 'Log Out', url: '/api/logout', alignClass: "right" });

                // manager
                if (this.access_level == 2) {
                    this.access_level.branchID;
                    common_nav.push({ title: 'Manager Dashboard', url: '/manage/branches/id/' + this.manages, alignClass: "right" });
                    // admin
                } else if (this.access_level == 3) {
                    common_nav.push({ title: 'Admin Dashboard', url: '/admin', alignClass: "right" });
                }

                common_nav.push({ title: 'Welcome ' + this.profile.first_name + '!', url: '/profile', alignClass: "right" });
                // logged out
            } else {
                common_nav.push({ title: 'Log In', url: '/login', alignClass: "right" });
                common_nav.push({ title: 'Register', url: '/register', alignClass: "right" });
            }

            return (common_nav);
        }
    },
    methods: {
        events_search() {
            // loading check
            this.isLoading = true;
            this.error = null;

            // Get the value of all the relevant filter options and search term
            let search_term = document.getElementById("events-search").value;
            let from_date = document.getElementById("from-date").value;
            let to_date = document.getElementById("to-date").value;
            let num_events = document.getElementById("num-events").value;
            let branches_selected = [];
            let branches_boxes = document.getElementsByName("branch_filters");
            for (let i = 0; i < branches_boxes.length; i++) {
                if (branches_boxes[i].checked) {
                    branches_selected.push(branches_boxes[i].value);
                }
            }

            console.log("search term: " + search_term);
            console.log("from date: " + from_date);
            console.log("to date: " + to_date);
            console.log("num events: " + num_events);
            console.log("branches selected: " + branches_selected);

            // Construct the query parameters
            let query_parameters = "?";
            if (search_term !== "") {
                query_parameters += "search=" + encodeURIComponent(search_term) + '&';
            }
            if (from_date !== "") {
                query_parameters += "from=" + encodeURIComponent(from_date) + '&';
            }
            if (to_date !== "") {
                query_parameters += "to=" + encodeURIComponent(to_date) + '&';
            }
            if (num_events !== "") {
                query_parameters += "n=" + encodeURIComponent(num_events) + '&';
            }
            for (let i = 0; i < branches_selected.length; i++) {
                query_parameters += "branch=" + encodeURIComponent(branches_selected[i]) + '&';
            }
            // remove the last &
            if (query_parameters !== "") {
                query_parameters = query_parameters.substring(0, query_parameters.length - 1);
            }
            console.log("query parameters: " + query_parameters);

            // Fetch the access level and then load events based on it
            this.getAccessLevel()
                .then(accessData => {
                    let query_path = "";
                    if (accessData.access_level > 0) {
                        // requires authentication on server
                        query_path = "/users/events/search" + query_parameters;
                    } else {
                        // Only allow public events
                        query_path = "/events/search" + query_parameters;
                    }

                    // AJAX
                    return fetch(query_path, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched events:", data);
                    this.events_results = data;
                })
                .catch(error => {
                    console.error("Error fetching events:", error);
                    this.events_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        events_load() {
            // loading check
            this.isLoading = true;
            this.error = null;

            // Fetch the access level and then load events based on it
            this.getAccessLevel()
                .then(accessData => {
                    let query_path = "";
                    if (accessData.access_level > 0) {
                        // requires authentication on server
                        query_path = "/users/events/get";
                    } else {
                        // Only allow public events
                        query_path = "/events/get";
                    }

                    // AJAX
                    return fetch(query_path, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched events:", data);
                    this.events_results = data;
                })
                .catch(error => {
                    console.error("Error fetching events:", error);
                    this.events_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        branch_events_load() {
            // loading check
            this.isLoading = true;
            this.error = null;
            let query_parameters = '';

            // for which branch
            if (window.location.pathname.split('/')[1] == 'branches' && window.location.pathname.split('/')[3] >= 0) {
                query_parameters += "?";
                let branchID = window.location.pathname.split('/')[3];
                query_parameters += "branch=" + encodeURIComponent(branchID);
            }

            let query_path = "/branches/events/get" + query_parameters;

            // AJAX
            fetch(query_path, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched events:", data);
                    this.events_results = data;
                })
                .catch(error => {
                    console.error("Error fetching events:", error);
                    this.events_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        news_search() {
            // loading check
            this.isLoading = true;
            this.error = null;

            // Get the value of all the relevant filter options and search term
            let search_term = document.getElementById("news-search").value;
            let from_date = document.getElementById("from-date").value;
            let to_date = document.getElementById("to-date").value;
            let num_news = document.getElementById("num-news").value;
            let branches_selected = [];
            let branches_boxes = document.getElementsByName("branch_filters");
            for (let i = 0; i < branches_boxes.length; i++) {
                if (branches_boxes[i].checked) {
                    branches_selected.push(branches_boxes[i].value);
                }
            }

            console.log("search term: " + search_term);
            console.log("from date: " + from_date);
            console.log("to date: " + to_date);
            console.log("num news: " + num_news);
            console.log("branches selected: " + branches_selected);

            // Construct the query parameters
            let query_parameters = "?";
            if (search_term !== "") {
                query_parameters += "search=" + encodeURIComponent(search_term) + '&';
            }
            if (from_date !== "") {
                query_parameters += "from=" + encodeURIComponent(from_date) + '&';
            }
            if (to_date !== "") {
                query_parameters += "to=" + encodeURIComponent(to_date) + '&';
            }
            if (num_news !== "") {
                query_parameters += "n=" + encodeURIComponent(num_news) + '&';
            }
            for (let i = 0; i < branches_selected.length; i++) {
                query_parameters += "branch=" + encodeURIComponent(branches_selected[i]) + '&';
            }
            // remove the last &
            if (query_parameters !== "") {
                query_parameters = query_parameters.substring(0, query_parameters.length - 1);
            }
            console.log("query parameters: " + query_parameters);

            // Fetch the access level and then load news based on it
            this.getAccessLevel()
                .then(accessData => {
                    let query_path = "";
                    if (accessData.access_level > 0) {
                        // requires authentication on server
                        query_path = "/users/news/search" + query_parameters;
                    } else {
                        // Only allow public events
                        query_path = "/news/search" + query_parameters;
                    }

                    // AJAX
                    return fetch(query_path, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched news:", data);
                    this.news_results = data;
                })
                .catch(error => {
                    console.error("Error fetching news:", error);
                    this.news_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        news_load() {
            // loading check
            this.isLoading = true;
            this.error = null;
            let query_parameters = '';

            // Fetch the access level and then load news based on it
            this.getAccessLevel()
                .then(accessData => {
                    let query_path = "";
                    if (accessData.access_level > 0) {
                        // requires authentication on server
                        query_path = "/users/news/get" + query_parameters;
                    } else {
                        // Only allow public events
                        query_path = "/news/get" + query_parameters;
                    }

                    // AJAX
                    return fetch(query_path, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched news:", data);
                    this.news_results = data;
                })
                .catch(error => {
                    console.error("Error fetching news:", error);
                    this.news_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        branches_load() {
            // loading check
            this.isLoading = true;
            this.error = null;

            // AJAX
            fetch('/branches/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched branches:", data);
                    this.branches_results = data;
                })
                .catch(error => {
                    console.error("Error fetching branches:", error);
                    this.branches_results = [];
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },

        news_show_more_results() {
            // Increase the max number of news shown by 5
            document.getElementById("num-news").value = parseInt(document.getElementById("num-news").value) + 5;

            // Call the news_search function to get the news from the server
            this.news_search();
        },
        events_show_more_results() {
            // Increase the max number of events shown by 5
            document.getElementById("num-events").value = parseInt(document.getElementById("num-events").value) + 5;

            // Call the events_search function to get the events from the server
            this.events_search();
        },
        RSVP(response, eventID) {
            if (typeof this.access_level === 'undefined' || this.access_level == 0) {
                // Visitor, redirect to login page
                alert('Please login to RSVP');
                window.location.href = '/login';
            } else {
                if (!eventID) {
                    console.error("No event ID found");
                    return;
                }

                const data = {
                    eventID: eventID.toString(),
                    RSVP: response
                };
                console.log("Sending data:", data);

                fetch('/users/events/rsvp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => {
                        if (response.ok) {
                            console.log("RSVP successful");
                            alert('RSVP Successful!');
                        } else if (response.status == 400) {
                            console.error("Invalid request data");
                            alert('RSVP Unsuccessful');
                        } else if (response.status == 500) {
                            console.error("Server error");
                        } else {
                            console.error("Unexpected error");
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error);
                    });
            }
        },
        getEventIDFromPath() {
            try { // try get event id from pathname for event details
                const path = window.location.pathname;
                const segments = path.split('/');
                return segments[segments.length - 1];
            } catch (error) {
                console.error("Error extracting event ID from pathname:", error);
            }
            return null;
        },
        editEvent(eventId) {
            window.location.href = `/manage/events/edit/${eventId}`;
        },
        eventRSVPresponse(eventId) {
            window.location.href = `/manage/events/responses/${eventId}`;
        },
        editNews(newsId) {
            window.location.href = `/manage/news/edit/${newsId}`;
        },
        editBranch(branchId) {
            window.location.href = `/manage/branches/edit/${branchId}`;
        },
        joinBranch(branchID) {
            // Send a POST request to join the branch
            fetch(`/branches/join/${branchID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Successfully joined the branch!');
                    } else {
                        alert('Failed to join the branch: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while joining the branch.');
                });
        },
        getProfileInfo() {
            fetch('/api/get/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched profile:", data);
                    this.profile = data;
                })
                .catch(error => {
                    console.error("Error fetching profile:", error);
                });
        },
        setProfileInfo() {
            fetch('/api/set/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.profile)
            })
                .then(response => {
                    if (response.ok) {
                        console.log("Profile updated successfully");
                        alert('Profile updated successfully!');
                    } else {
                        throw new Error(`Error status: ${response.status}`);
                    }
                })
                .catch(error => {
                    console.error("Error updating profile:", error);
                    alert('Failed to update profile.');
                });
        },
        async alt_profile_picture_upload()  {
            var vm = this;
            const form = document.getElementById("upload_form");
            const status_text = document.getElementById("status_text");
            var form_data = new FormData(form);
            var im_path;
            const response = await fetch(form.action,
                {
                    method: form.method,
                    headers: {
                        'accept': 'application/JSON'
                    },
                    body: form_data,
                    processData: false,
                    contentType: false
                });
            if (response.ok) {
                resp_json = response.json();
                resp_json.then(function (resp_json) {
                    status_text.innerText = "Uploaded Succesfully!";
                    vm.profile.image_url = resp_json.image_path;
                })
            } else {
                status_text.innerText = "Upload Failed! If this persists, try refreshing the page";
            }
        },
        async news_picture_upload() {
            const form = document.getElementById("upload_form");
            const status_text = document.getElementById("status_text");
            const im_path_p = document.getElementById("image_path");
            var form_data = new FormData(form);
            const response = await fetch(form.action,
                {
                    method: form.method,
                    headers: {
                        'accept': 'application/JSON'
                    },
                    body: form_data,
                    processData: false,
                    contentType: false
                });
            if (response.ok) {
                resp_json = response.json();
                resp_json.then(function (resp_json) {
                    status_text.innerText = "Uploaded Succesfully!";
                    im_path_p.innerText = resp_json.image_path;
                    document.getElementById("news_image").src = resp_json.image_path;
                })
            } else {
                status_text.innerText = "Upload Failed! If this persists, try refreshing the page";
            }
        },
        getAccessLevel() {
            return fetch('/api/access', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(`Error status: ${response.status}`);
                    }
                })
                .then(data => {
                    this.access_level = data.access_level;
                    this.manages = data.manages;
                    this.branches = data.branches;
                    return data;
                })
                .catch(error => {
                    console.error('Error fetching access level:', error);
                    throw error;
                });
        },
        getEventInfo(eventID) {
            fetch(`/api/get/event/${eventID}/details.json`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched event:", data);
                    this.eventInfo = data;
                    this.image_path = data.event_image;
                })
                .catch(error => {
                    console.error("Error fetching event:", error);
                });
        },
        getNewsInfo(articleID) {
            fetch(`/api/get/news/${articleID}/details.json`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched news:", data);
                    this.newsInfo = data;
                    this.image_path = data.image_url;
                })
                .catch(error => {
                    console.error("Error fetching news:", error);
                });
        },

    },
    mounted() {
        // load events on page initally, probably a better way to do this
        if (window.location.pathname.split('/')[1] == 'events' && !window.location.pathname.split('/')[2]) {
            this.events_load();
        }
        // on branch details page show events also but only for that branch
        if (window.location.pathname.split('/')[1] == 'branches' && window.location.pathname.split('/')[2] == 'id') {
            this.branch_events_load();
        }
        // load news on news page
        if (window.location.pathname.split('/')[1] == 'news' && !window.location.pathname.split('/')[2]) {
            this.news_load();
        }
        // load news on main page
        if (!window.location.pathname.split('/')[1]) {
            this.news_load();
        }

        // load branches on branches page (also needed for events and news filtering)
        if ((window.location.pathname.split('/')[1] == 'branches' || window.location.pathname.split('/')[1] == 'events' || window.location.pathname.split('/')[1] == 'news') && !window.location.pathname.split('/')[2]) {
            this.branches_load();
        }

        this.getAccessLevel();

        // load profile info on profile info page if user is logged in
        // this currently runs on every page - there needs to be a way that makes this not run
        // if the user isn't logged in... but this is what checks if the user is logged
        this.getProfileInfo();

        // edit event
        if (window.location.pathname.split('/')[1] == 'manage' && window.location.pathname.split('/')[2] == 'events' && window.location.pathname.split('/')[3] == 'edit') {
            let editEventID = window.location.pathname.split('/')[4];
            this.getEventInfo(editEventID);
        }

        // edit news
        if (window.location.pathname.split('/')[1] == 'manage' && window.location.pathname.split('/')[2] == 'news' && window.location.pathname.split('/')[3] == 'edit') {
            let editNewsID = window.location.pathname.split('/')[4];
            this.getNewsInfo(editNewsID);
        }


    }
}).mount('#app');