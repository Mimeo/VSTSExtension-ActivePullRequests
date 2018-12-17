import { VssPullRequests } from "./vss-pull-requests.service";
declare var sorttable: any;

const prClient = new VssPullRequests();
prClient.getPullRequests().then(prs => {
    // Build the table
    const tableHeader = document.getElementById("pr-header");
    tableHeader.innerText += " (" + prs.length + " pull request" + (prs.length === 1 ? "" : "s") + ")";
    const tableBody = document.getElementById("pr-body");
    console.log("*** pull request data ***", prs);
    prs.forEach(pr => {
        const repoUrl = pr.baseUri + encodeURIComponent(pr.projectName) + "/_git/" + encodeURIComponent(pr.repo);
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-row");
        // User Avatar cell
        const tableCellUserAvatar = document.createElement("td");
        tableCellUserAvatar.innerHTML = "<img class='user-avatar' src='" + pr.createdBy.imageUrl + "' alt='" + pr.createdBy.uniqueName + "\'s avatar' />";
        tableRow.appendChild(tableCellUserAvatar);
        // Created By cell
        const tableCellUser = document.createElement("td");
        tableCellUser.innerText = pr.createdBy.displayName;
        tableRow.appendChild(tableCellUser);
        // Pull Request ID cell
        const tableCellId = document.createElement("td");
        tableCellId.setAttribute("sorttable_customkey", "" + pr.id);
        tableCellId.innerHTML = "<a href='" + repoUrl + "/pullRequest/" + pr.id + "' target='_top'>#" + pr.id + "</a>";
        tableRow.appendChild(tableCellId);
        // Title cell
        const tableCellTitle = document.createElement("td");
        tableCellTitle.innerText = pr.title;
        tableRow.appendChild(tableCellTitle);
        // Repository cell
        const tableCellRepo = document.createElement("td");
        tableCellRepo.innerText = pr.repo;
        tableRow.appendChild(tableCellRepo);
        // Base cell
        const tableCellBaseBranch = document.createElement("td");
        tableCellBaseBranch.innerHTML = "<a href='" + repoUrl + "?version=GB" + encodeURIComponent(pr.baseBranch) + "' target='_top'>" + pr.baseBranch + "</a>";
        tableRow.appendChild(tableCellBaseBranch);
        // Target cell
        const tableCellTargetBranch = document.createElement("td");
        tableCellTargetBranch.innerHTML = "<a href='" + repoUrl + "?version=GB" + encodeURIComponent(pr.targetBranch) + "' target='_top'>" + pr.targetBranch + "</a>";
        tableRow.appendChild(tableCellTargetBranch);
        // My Vote cell
        const tableCellVote = document.createElement("td");
        const vote = prClient.voteNumberToVote(pr.vote);
        tableCellVote.innerHTML = vote.icon + " " + vote.message;
        if (vote.color !== undefined) {
            tableCellVote.style.color = vote.color;
        }
        tableRow.appendChild(tableCellVote);
        // Reviewers cell
        const tableCellReviewers = document.createElement("td");
        tableCellReviewers.classList.add("reviewers-cell");
        tableCellReviewers.setAttribute("sorttable_customkey", "" + pr.reviewers.length);
        pr.reviewers.forEach(reviewer => {
            const reviewerVote = prClient.voteNumberToVote(reviewer.vote);
            const reviewerElement = document.createElement("span");
            reviewerElement.classList.add("reviewer-icon");
            reviewerElement.innerHTML += "<img class='user-avatar' src='" + reviewer.imageUrl + "' alt=\"" + reviewer.uniqueName + "'s avatar\" />";
            reviewerElement.innerHTML += "<div class='vote-icon'>" + reviewerVote.icon + "</div>";
            tableCellReviewers.appendChild(reviewerElement);
        });
        tableRow.appendChild(tableCellReviewers);
        tableBody.appendChild(tableRow);
    });
}).then(() => sorttable.makeSortable(document.getElementById("pr-table"))).then(() => {
    const prIdHeader = document.getElementsByClassName("pr-id-header")[0];
    sorttable.innerSortFunction.apply(prIdHeader, []);
    document.getElementById("pr-body").classList.remove("loading");
    document.getElementById("pr-body").classList.add("loaded");
});
