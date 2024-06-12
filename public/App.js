const { createApp, ref } = Vue;

const people = [
    {
        id: 1,
        name: 'John Doe',
        address: '129 Waymouth Street, Adelaide SA 5000',
        phone: '0412345678',
        email: 'johndoe@mealmates.com'
    },
    {
        id: 2,
        name: 'Mike Smith',
        address: '129 Waymouth Street, Adelaide SA 5000',
        phone: '0412345678',
        email: 'mikesmith@mealmates.com'
    },
    {
        id: 3,
        name: 'Earl Grey',
        address: '129 Waymouth Street, Adelaide SA 5000',
        phone: '0412345678',
        email: 'earl@mealmates.com'
    },
    {
        id: 4,
        name: 'Adam James',
        address: '129 Waymouth Street, Adelaide SA 5000',
        phone: '0412345678',
        email: 'adamjames@mealmates.com'
    },
];

createApp({
    data() {
        return {
            access_level: 1,    // 0 for visitor, 1 for user, 2 for manager, 3 for admin
            message: 'Hello Vue!',
            events_results: [],
            show_events_filters: false,
            branches_results: null,
            event_selected: null, // set to null intially in real thing
            event_attendance: 4,
            news_results: [],
            show_preview: true,
            create_news_preview: "",
            news_array: [],
            news_array1: [],
            article_selected: null,
            num_points: 1,
            point_level: [0],
            branch_selected: null,
            people: people,
            profile: {
                id: '',
                username: '',
                password: '',
                first_name: '',
                last_name: '',
                phone_num: '',
                email: '',
                postcode: '',
                description: '',
                image_url: ''
            }, // returns profile information for profile_page.html
            loading: true,
            event: null,
            isLoading: false,
            error: null,
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
            if (this.profile.username) {
                return [
                    { title: 'Home', url: '/' },
                    { title: 'Events', url: '/events' },
                    { title: 'News', url: '/news' },
                    { title: 'Branches', url: '/branches' },
                    { title: 'Welcome ' + this.profile.first_name + '!', url: '/profile' }
                ];
            } else {
                return [
                    { title: 'Home', url: '/' },
                    { title: 'Events', url: '/events' },
                    { title: 'News', url: '/news' },
                    { title: 'Branches', url: '/branches' },
                    { title: 'Log In', url: '/login' }
                ];
            }
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

            // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
            let query_path = "";
            if (this.access_level > 0) {
                // requires authentication on server
                query_path = "/users/events/search" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/events/search" + query_parameters;
            }
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
        events_load() {
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

            // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
            let query_path = "";
            if (this.access_level > 0) {
                // requires authentication on server
                query_path = "/users/events/get" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/events/get" + query_parameters;
            }

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

            // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
            let query_path = "";
            if (this.access_level > 0) {
                // requires authentication on server
                query_path = "/users/news/search" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/news/search" + query_parameters;
            }

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

            // Construct the URL based on whether user is logged in or not (to determine whether they can see private events or not)
            let query_path = "";
            if (this.access_level > 0) {
                // requires authentication on server
                query_path = "/users/news/get" + query_parameters;
            } else {
                // Only allow public events
                query_path = "/news/get" + query_parameters;
            }

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
        selectBranch(branchId) {
            this.branch_selected = testBranchSummary.find(branch => branch.id === branchId);
            window.location.href = `/branches/id/${branchId}`;
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
        }
    },
    mounted() {
        // load events on page initally, probably a better way to do this
        if (window.location.pathname.split('/')[1] == 'events' && !window.location.pathname.split('/')[2]) {
            this.events_load();
        }
        // on branch details page show events also but only for that branch
        if (window.location.pathname.split('/')[1] == 'branches' && window.location.pathname.split('/')[2] == 'id') {
            this.events_load();
        }
        // load news on news page
        if (window.location.pathname.split('/')[1] == 'news' && !window.location.pathname.split('/')[2]) {
            this.news_load();
        }
        // load news on main page
        if (!window.location.pathname.split('/')[1]) {
            this.news_load();
        }
        // load branches on branches page
        if (window.location.pathname.split('/')[1] == 'branches' && !window.location.pathname.split('/')[2]) {
            this.branches_load();
        }
        // load profile info on profile info page
        // if (window.location.pathname.split('/')[1] == 'profile_page.html') {
            this.getProfileInfo();
        // }
    }
}).mount('#app');