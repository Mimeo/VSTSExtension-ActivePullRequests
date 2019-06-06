import { VssPullRequests } from "./vss-pull-requests.service";
declare var sorttable: any;

const prClient = new VssPullRequests();
prClient.getPullRequests().then(prs => prClient.applyLatestBuilds(prs)).then(prBuilds => {
    // Build the table
    const tableHeader = document.getElementById("pr-header");
    tableHeader.innerText += " (" + prBuilds.length + " pull request" + (prBuilds.length === 1 ? "" : "s") + ")";
    const tableBody = document.getElementById("pr-body");
    console.log("*** pull request data ***", prBuilds);
    prBuilds.forEach(prBuild => {
        const repoUrl = prBuild.pr.baseUri + encodeURIComponent(prBuild.pr.projectName) + "/_git/" + encodeURIComponent(prBuild.pr.repo);
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-row");
        // User Avatar cell
        const tableCellUserAvatar = document.createElement("td");
        tableCellUserAvatar.innerHTML = "<img class='user-avatar' src='" + prBuild.pr.createdBy.imageUrl + "' alt='" + prBuild.pr.createdBy.uniqueName + "\'s avatar' />";
        tableRow.appendChild(tableCellUserAvatar);
        // Created By cell
        const tableCellUser = document.createElement("td");
        tableCellUser.innerText = prBuild.pr.createdBy.displayName;
        tableRow.appendChild(tableCellUser);
        // Pull Request ID cell
        const tableCellId = document.createElement("td");
        tableCellId.setAttribute("sorttable_customkey", "" + prBuild.pr.id);
        tableCellId.innerHTML = "<a href='" + repoUrl + "/pullRequest/" + prBuild.pr.id + "' target='_top'>#" + prBuild.pr.id + "</a>";
        tableRow.appendChild(tableCellId);
        // Title cell
        const tableCellTitle = document.createElement("td");
        tableCellTitle.innerText = prBuild.pr.title;
        tableRow.appendChild(tableCellTitle);
        // Repository cell
        const tableCellRepo = document.createElement("td");
        tableCellRepo.innerText = prBuild.pr.repo;
        tableRow.appendChild(tableCellRepo);
        // Base cell
        const tableCellBaseBranch = document.createElement("td");
        tableCellBaseBranch.innerHTML = `<a href="${repoUrl}?version=GB${encodeURIComponent(prBuild.pr.baseBranch)}" target="_top"><span class="bowtie-icon bowtie-tfvc-branch"></span>${prBuild.pr.baseBranch}</a>`;
        tableRow.appendChild(tableCellBaseBranch);
        // Target cell
        const tableCellTargetBranch = document.createElement("td");
        tableCellTargetBranch.innerHTML = `<a href="${repoUrl}?version=GB${encodeURIComponent(prBuild.pr.targetBranch)}" target="_top"><span class="bowtie-icon bowtie-tfvc-branch"></span>${prBuild.pr.targetBranch}</a>`;
        tableRow.appendChild(tableCellTargetBranch);
        // Build Status cell
        const tableCellBuildStatus = document.createElement("td");
        const buildDisplay = prClient.buildStatusToBuildDisplay(prBuild.build);
        tableCellBuildStatus.setAttribute("sorttable_customkey", prBuild.build.status.toString());
        tableCellBuildStatus.innerHTML = (buildDisplay.icon != null ? `<span class="icon bowtie-icon bowtie-${buildDisplay.icon}"></span> ` : "") + buildDisplay.message;
        tableCellBuildStatus.style.color = buildDisplay.color != null ? buildDisplay.color : "#808080";
        tableRow.appendChild(tableCellBuildStatus);
        // My Vote cell
        const tableCellVote = document.createElement("td");
        tableCellVote.setAttribute("sorttable_customkey", "" + prBuild.pr.vote);
        const vote = prClient.voteNumberToVote(prBuild.pr.vote);
        tableCellVote.innerHTML = vote.icon + " " + vote.message;
        if (vote.color !== undefined) {
            tableCellVote.style.color = vote.color;
        }
        tableRow.appendChild(tableCellVote);
        // Reviewers cell
        const tableCellReviewers = document.createElement("td");
        tableCellReviewers.classList.add("reviewers-cell");
        tableCellReviewers.setAttribute("sorttable_customkey", "" + prBuild.pr.reviewers.length);
        prBuild.pr.reviewers.map(x => {
            return { vote: prClient.voteNumberToVote(x.vote), reviewer: x };
        }).sort(x => x.vote.order).forEach(reviewerVote => {
            const reviewerElement = document.createElement("span");
            reviewerElement.classList.add("reviewer-icon");
            reviewerElement.innerHTML += `<img class="user-avatar" src="${reviewerVote.reviewer.imageUrl}" alt="${reviewerVote.reviewer.uniqueName}'s avatar" />`;
            reviewerElement.innerHTML += "<div class='vote-icon'>" + reviewerVote.vote.icon + "</div>";
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
