Blog = {};
Blog.Settings = {};
Blog.Settings.ImageSrcPrefix = "images/posts/";
Blog.Settings.MaxPostsPerPage = 5;
Blog.Navigation = {};
Blog.Navigation.PostsSection = "Posts";
Blog.Navigation.SinglePostSection = "SinglePost";
Blog.Navigation.ArchiveSection = "Archive";
Blog.Navigation.RandomSection = "Random";
Blog.Navigation.TagsSection = "Tags";
Blog.Navigation.SingleTagSection = "SingleTag";
Blog.Navigation.refreshCurrentPage = function() {
	Blog.Navigation.Section = Blog.Navigation.getCurrentSection();
	Blog.Navigation.CurrentPage = Blog.Navigation.getCurrentPage();
};
Blog.Navigation.wireUpHashChangeListener = function(){
	$(window).on('hashchange', Blog.Navigation.onHashChange);
};
Blog.Navigation.onHashChange = function() {
	if(!Blog.PostData.Index) {
		var url = Blog.Data.getIndexDataUrl();
		$.get(url)
			.done(function(data) {
				Blog.Data.load(data);
				Blog.Navigation.naviagteToPage();
			})
			.fail(Blog.Content.reportLoadFailure);
	} else { 
		Blog.Navigation.naviagteToPage();
	}
};
Blog.Navigation.getCurrentSection = function() {
	var section = Blog.Navigation.PostsSection;
	var hash = location.hash.substring(2);
	if(hash && hash.indexOf("archive") == 0) {
		section = Blog.Navigation.ArchiveSection;
	} else if(hash && hash.indexOf("tags") == 0) {
		section = Blog.Navigation.TagsSection;
	} else if(hash && hash.indexOf("random") == 0) {
		section = Blog.Navigation.RandomSection;
	} else if(hash && hash.indexOf("post-") == 0) {
		section = Blog.Navigation.SinglePostSection;
	} else if(hash && hash.indexOf("tag-") == 0) {
		section = Blog.Navigation.SingleTagSection;
	}
	return section;
};
Blog.Navigation.buildPageLink = function(pageNumber) {
	return "#!page" + pageNumber;
} 
Blog.Navigation.buildSinglePostLink = function(postId) {
	return "#!" + "post-" + postId;
};
Blog.Navigation.buildTagLink = function(tag) {
	return "#!tag-"+tag;
};
Blog.Navigation.buildImageSrc = function(date, imageName) {
	return Blog.Settings.ImageSrcPrefix + Blog.Data.formatDateYearSlashMonth(date) + "/" + imageName;
}
Blog.Navigation.getSelectedSinglePostId = function() {
	var idStart = location.hash.indexOf("post-") + 5;
	var postId = location.hash.substring(idStart);
	return postId;
};
Blog.Navigation.getSelectedSingleTag = function() {
	var idStart = location.hash.indexOf("tag-") + 4;
	var tagId = unescape(location.hash.substring(idStart));
	return tagId;
};
Blog.Navigation.getCurrentPage = function() {
	var page = 1
	var hash = location.hash.substring(2);
	if(hash && hash.indexOf("page") == 0) {
		page = parseInt(hash.substring(4)) || 1;
	}
	return page;
};
Blog.Navigation.getMinPage = function() {
	if(Blog.Navigation.CurrentPage <= 3){
		return 1; 
	}

	var min = Blog.Navigation.CurrentPage - 2;
	var totalPages = Blog.Navigation.getTotalPages();
	if(Blog.Navigation.CurrentPage + 2 > totalPages)
		min = totalPages - 4;

	return min;
};
Blog.Navigation.getMaxPage = function() {
	var max = Blog.Navigation.CurrentPage <= 3 ? 5 : Blog.Navigation.CurrentPage + 2
	var totalPages = Blog.Navigation.getTotalPages();
	return max > totalPages ? totalPages : max;
};
Blog.Navigation.getTotalPages = function() {
	return Math.ceil(Blog.PostData.Index.length / Blog.Settings.MaxPostsPerPage);
};
Blog.Navigation.getPostIndex = function(postId) {
	var index = 0;
	while(index < Blog.PostData.Index.length && Blog.PostData.Index[index].id != postId)
		index++;
	return index;
};
Blog.Navigation.naviagteToPage = function() {
	Blog.Navigation.refreshCurrentPage();
	Blog.Content.reset();
	if(Blog.Navigation.Section == Blog.Navigation.ArchiveSection){
		Blog.Content.renderArchive();
	} else if(Blog.Navigation.Section == Blog.Navigation.TagsSection){
		Blog.Content.renderTags();
	} else if(Blog.Navigation.Section == Blog.Navigation.RandomSection){
		Blog.Content.renderRandom();
	} else if(Blog.Navigation.Section == Blog.Navigation.SinglePostSection){
		Blog.Content.renderSinglePost();
	} else if(Blog.Navigation.Section == Blog.Navigation.SingleTagSection){
		Blog.Content.renderSingleTag();
	} else {
		Blog.Content.renderRecentPosts();
	}
};
Blog.Data = {};
Blog.Data.DataRoot = "posts/v1/";
Blog.Data.getIndexDataUrl = function() {
	return Blog.Data.DataRoot + "index.json";
};
Blog.Data.getPostDataUrl = function(id) {
	var postIndex = Blog.Navigation.getPostIndex(id);
	var postDate = Blog.Data.parseIsoDate(Blog.PostData.Index[postIndex].date);
	var monthNumber = postDate.getMonth() + 1;
	var postYear = postDate.getFullYear();
	var postMonth = monthNumber < 10 ? "0" + monthNumber : monthNumber;
	return Blog.Data.DataRoot + postYear + "/" + postMonth + "/" + id + ".json";
};
Blog.Data.load = function(postIndexData) {
	Blog.PostData.Index = postIndexData.posts;
	Blog.PostData.TagCloud = postIndexData.tags;
};
Blog.Data.loadPost = function(id) {
	var postUrl = Blog.Data.getPostDataUrl(id);
	$.get(postUrl)
		.done(Blog.Content.renderPost)
		.fail(Blog.Content.reportPostLoadFailure);
};
Blog.Data.convertImageUrlToThumbUrl = function(filename) {
	var extensionIndex = filename.lastIndexOf(".");
	return filename.substring(0,extensionIndex+1) + "thumb" + filename.substring(extensionIndex, filename.length);
};
Blog.Data.convertImageUrlToSmallUrl = function(filename) {
	var extensionIndex = filename.lastIndexOf(".");
	return filename.substring(0,extensionIndex+1) + "small" + filename.substring(extensionIndex, filename.length);
};
Blog.Data.LongMonthNames = ["January","February","March","April","May","June","July","August", "September", "October","November","December"];
Blog.Data.parseIsoDate = function(dateString) {
	return new Date(Date.parse(dateString));
};
Blog.Data.formatDateLongMonthYear = function(date) {
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	return Blog.Data.LongMonthNames[monthIndex] + " " + year;
};
Blog.Data.formatDateYearSlashMonth = function(date) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	return year + "/" + (month > 9 ? month : "0" + month);
};
Blog.Data.formatDateDdMmmYyyy = function(date) {
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	return Blog.Data.formatOrdinalNumber(day) + " " + Blog.Data.LongMonthNames[monthIndex].substring(0,3) + " " + year;
};
Blog.Data.formatOrdinalNumber = function(number) {
	var digit1 = number % 10,
	digit2 = number % 100;
	if (digit1 == 1 && digit2 != 11) {
		return number + "st";
	}
	if (digit1 == 2 && digit2 != 12) {
		return number + "nd";
	}
	if (digit1 == 3 && digit2 != 13) {
		return number + "rd";
	}
	return number + "th";
}
Blog.Css = {};
Blog.Css.ImageRowLayout = ["post-image-100","post-image-50","post-image-33","post-image-25"];
Blog.Content = {};
Blog.Content.reset = function() {
	$("html,body").animate({scrollTop: 0});
	$(".container").empty();
	$(".container-wide").empty();
}
Blog.Content.renderRecentPosts = function() {
	var allPosts = $("<div>").attr("id","posts").appendTo($(".container"));
	var firstPost = (Blog.Navigation.CurrentPage - 1) * Blog.Settings.MaxPostsPerPage;
	var lastPost = firstPost + Blog.Settings.MaxPostsPerPage;
	for(var p = firstPost; p < lastPost && p < Blog.PostData.Index.length; p++){
		var postId = Blog.PostData.Index[p].id;
		allPosts.append($("<div>").addClass("post").attr("id",postId));
		Blog.Data.loadPost(postId);
	}
	Blog.Content.createPagingControls();
};
Blog.Content.renderSinglePost = function() {
	var allPosts = $("<div>").attr("id","posts").appendTo($(".container"));
	var postId = Blog.Navigation.getSelectedSinglePostId();
	allPosts.append($("<div>").addClass("post").attr("id",postId));
	Blog.Data.loadPost(postId);
	Blog.Content.createNextAndPreviousPagingControls(postId);
};
Blog.Content.renderPost = function(postData) {
	var post = Blog.Content.createPost(postData);
	var postElement = $("#"+postData.id);
	postElement.append(post);
};
Blog.Content.reportLoadFailure = function() {
	Blog.Content.reset();
	var error = $("<p>").text("Error loading posts - please try again later.").addClass("error");
	$(".container").html(error);
};
Blog.Content.reportPostLoadFailure = function() {
	console.log("Unable to load post");
}		
Blog.Content.createPost = function(postData){
	var date = $("<div>").addClass("post-date");
	var postDate = Blog.Data.parseIsoDate(postData.date);
	var textDate = Blog.Data.formatDateDdMmmYyyy(postDate);
	if(Blog.Navigation.Section != Blog.Navigation.SinglePostSection) {
		var postLink = $("<a></a>")
			.addClass("single-post")
			.attr("href",Blog.Navigation.buildSinglePostLink(postData.id))
			.text(textDate);				
		$("<p>").append(postLink).appendTo(date);
	} else {
		$("<p>").text(textDate).appendTo(date);
	}

	var title = $("<div>").addClass("post-title");
	if(postData.title){
		$("<h2>").text(postData.title).appendTo(title);				
	}

	var intro = $("<div>").addClass("post-intro");
	if(postData.intro){
		$("<p>").text(postData.intro).appendTo(intro);				
	}

	var images = $("<div>").addClass("post-images");	
	if(postData.images){
		var imageGroupId = "photo-set-" + postData.id;		
		var totalImages = postData.images.fileNames.length;
		var rows = postData.images.rowSizes.length;
		var nextImage = 0;
		for(var r=0; r<rows; r++) {
			var imagesInRow = postData.images.rowSizes[r];
			var imgClass = Blog.Css.ImageRowLayout[imagesInRow-1];
			var imageRow = $("<div>").addClass("post-images-row").appendTo(images);
			for(var ri = 0; ri < imagesInRow && nextImage < totalImages; ri++) {						
				var imgSrc = Blog.Navigation.buildImageSrc(postDate, postData.images.fileNames[nextImage]);
				var smallImg = Blog.Data.convertImageUrlToSmallUrl(imgSrc);
				var carouselLink = $("<a>")
					.attr('href', imgSrc)
					.attr('data-lightbox', imageGroupId)
					.appendTo(imageRow);
				$("<img>").attr('src', smallImg).addClass(imgClass).appendTo(carouselLink);
				nextImage++;
			}
		}
	}

	var video = $("<div>").addClass("post-video");	
	if(postData.video){
		var videoFrame = $("<iframe>")
			.attr('width', 490)
			.attr('height', 350)
			.attr('frameborder', 0)
			.attr('allow', 'autoplay; encrypted-media')
			.attr('allowfullscreen', '')
			.attr('src', 'https://www.youtube-nocookie.com/embed/' + postData.video)
			.appendTo(video);
	}

	var content = $("<div>").addClass("post-body");
	if(postData.content){
		for(var p=0; p<postData.content.length; p++){
			var para = Blog.Content.createContentParagraph(postData.content[p], postData.contentLinks);
			content.append(para);									
		}
	}

	var tags = $("<div>").addClass("tags");
	if(postData.tags && postData.tags.length > 0){
		var tagList = $("<ul>").appendTo(tags);
		for(var t=0; t<postData.tags.length; t++){
			var tag = $("<li>").addClass("tag").appendTo(tagList);
			$("<a>").attr("href",Blog.Navigation.buildTagLink(postData.tags[t]))
				.text(postData.tags[t])
				.appendTo(tag);
		}
	}

	var newPost = $("<div>").addClass("post");
	newPost.append(date);
	newPost.append(title);
	newPost.append(intro);
	newPost.append(images);
	newPost.append(video);
	newPost.append(content);
	newPost.append(tags);
	return newPost;
};
Blog.Content.createContentParagraph = function(text, links){
	var paragraph = $("<p>");
	if(!links){
		$("<span>").text(text).appendTo(paragraph);
		return paragraph;
	}

	var nextLink = Blog.Content.findNextLink(text, links);
	while(nextLink != null){
		if(nextLink.index > 0) {
			var textBefore = text.substring(0, nextLink.index);
			$("<span>").text(textBefore).appendTo(paragraph);
		}

		var linkText = nextLink.placeholder.substring(1, nextLink.placeholder.length-1);
		var url = nextLink.url;
		var link = $("<a></a>")
			.attr("href", url)
			.attr("target", "_blank")
			.text(linkText)
			.appendTo(paragraph);

		var remainingTextIndex = nextLink.index + nextLink.placeholder.length;
		text = text.substring(remainingTextIndex);

		var nextLink = Blog.Content.findNextLink(text, links)
	}

	if(text.length > 0)
		$("<span>").text(text).appendTo(paragraph);

	return paragraph;
}
Blog.Content.findNextLink = function(text, links){
	var nextLink = {index: -1};
	for(var l=0; l<links.length; l++){
		var placeholder = links[l][0];
		var nextLinkIndex = text.indexOf(placeholder);
		if(nextLinkIndex >= 0 && (nextLink.index == -1 || nextLinkIndex < nextLink.index)){
			nextLink.index = nextLinkIndex;
			nextLink.placeholder = placeholder;
			nextLink.url = links[l][1];
		}
	}

	if(nextLink.index == -1)
		return null;

	return nextLink;
}
Blog.Content.createPagingControls = function() {			
	var minPage =  Blog.Navigation.getMinPage();
	var maxPage =  Blog.Navigation.getMaxPage();
	var totalPages = Blog.Navigation.getTotalPages();

	var paging = $("<ul>");
	if(minPage > 1) {
		var newer = $("<li>").addClass("paging").addClass("paging-newer").appendTo(paging);
		var url = Blog.Navigation.buildPageLink(minPage - 1);
		var link = $("<a></a>")
			.attr("href", url)
			.text("Newer")
			.appendTo(newer);
	}

	for(var p=minPage; p<=maxPage; p++){
		var item = $("<li>").addClass("paging").appendTo(paging);
		if(p != Blog.Navigation.CurrentPage){
			var url = Blog.Navigation.buildPageLink(p);
			var link = $("<a></a>")
				.attr("href", url)
				.text(p)
				.appendTo(item);
		} else {
			item.text(p);
		}
	}

	if(maxPage < totalPages) {
		var older = $("<li>").addClass("paging").addClass("paging-older").appendTo(paging);
		var url = Blog.Navigation.buildPageLink(maxPage + 1);
		var link = $("<a></a>")
			.attr("href", url)
			.text("Older")
			.appendTo(older);
	}

	var nav = $("<div>").addClass("navigation");
	nav.append(paging);
	$(".container").append(nav);
};
Blog.Content.createNextAndPreviousPagingControls = function(currentPostId) {			
	var currentPostIndex = Blog.Navigation.getPostIndex(currentPostId)

	var paging = $("<ul>");
	if(currentPostIndex - 1 >= 0) {
		var next = $("<li>").addClass("paging").appendTo(paging);
		var nextPageId = Blog.PostData.Index[currentPostIndex - 1].id;
		var url = Blog.Navigation.buildSinglePostLink(nextPageId);
		var link = $("<a></a>")
			.attr("href", url)
			.text("Newer")
			.appendTo(next);
	}

	if(currentPostIndex + 1 < Blog.PostData.Index.length) {
		var prev = $("<li>").addClass("paging").appendTo(paging);
		var prevPageId = Blog.PostData.Index[currentPostIndex + 1].id;
		var url = Blog.Navigation.buildSinglePostLink(prevPageId);
		var link = $("<a></a>")
			.attr("href", url)
			.text("Older")
			.appendTo(prev);
	}

	var nav = $("<div>").addClass("navigation");
	nav.append(paging);
	$(".container").append(nav);
}
Blog.Content.renderArchive = function() {
	var archive = $("<div>").addClass("archive");
	var currentMonthYear = {};
	var currentMonthYearPosts = {};
	for(var p = 0; p < Blog.PostData.Index.length; p++){
		var post = Blog.PostData.Index[p]
		var postDate = Blog.Data.parseIsoDate(post.date);
		var postMonthYear = Blog.Data.formatDateLongMonthYear(postDate);
		if(currentMonthYear != postMonthYear) {
			currentMonthYear = postMonthYear;
			$("<p>").addClass("archive-posts-date").text(currentMonthYear).appendTo(archive);
			currentMonthYearPosts = $("<div>").addClass("archive-posts").appendTo(archive);
		}
		var archivePost = $("<div>").addClass("archive-post").appendTo(currentMonthYearPosts);
		var link = $("<a>").attr("href", Blog.Navigation.buildSinglePostLink(post.id))
			.attr("alt", post.id.replace("-", " "))
			.appendTo(archivePost);
		$("<div>").addClass("archive-post-image-overlay").appendTo(link);
		$("<span>").text(Blog.Data.formatDateDdMmmYyyy(postDate)).addClass("archive-post-date").appendTo(link);
		if(post.coverImage) {
			var thumbUrl = Blog.Data.convertImageUrlToThumbUrl(post.coverImage);
			var imageSrc = Blog.Navigation.buildImageSrc(postDate, thumbUrl)
		} else {
			var imageSrc = "images/archive-placeholder.thumb.jpg"
		}
		$("<img>").attr("src", imageSrc).addClass("archive-post-image").appendTo(link);
		if(post.coverImageAlt) {
			$("<span>").text(post.coverImageAlt).addClass("archive-post-image-alt").appendTo(link);
		}
		$("<span>").text(Blog.Content.formatArchiveTags(post.tags)).addClass("archive-post-tags").appendTo(link);
	}

	$(".container-wide").append(archive);			
};
Blog.Content.formatArchiveTags = function(tags) {
	var formatted = "";
	if(tags && tags.length > 0) {
		for (var i = 0; i < tags.length; i++) {
			if(i > 0)
				formatted += " ";
			formatted += "#"
			formatted += tags[i]
		}
	}
	return formatted;
};
Blog.Content.renderTags = function() {
	var tags = $("<div>").addClass("tag-cloud");
	for (var i = 0; i < Blog.PostData.TagCloud.length; i++) {
		$("<a>").attr("href",Blog.Navigation.buildTagLink(Blog.PostData.TagCloud[i].name))
			.text(Blog.PostData.TagCloud[i].name)
			.addClass("tag-group-" + Blog.PostData.TagCloud[i].bucket)
			.appendTo(tags);
	};
	$(".container").append(tags);
};	
Blog.Content.renderSingleTag = function() {
	var tagId = Blog.Navigation.getSelectedSingleTag();
	var allPosts = $("<div>").attr("id","posts");
	$(".container").append(allPosts);
	for(var p = 0; p < Blog.PostData.Index.length; p++){
		var tags = Blog.PostData.Index[p].tags;
		if(tags){
			for (var t = 0; t < tags.length; t++) {
				if(tags[t] == tagId) {
					var postId = Blog.PostData.Index[p].id;
					$("<div>").addClass("post").attr("id",postId).appendTo(allPosts);
					Blog.Data.loadPost(postId);
					break;
				}
			}
		}
	}
}	
Blog.Content.renderRandom = function() {
	var chosen = Math.floor(Math.random() * Blog.PostData.Index.length); 
	var post = Blog.PostData.Index[chosen];
	var url = Blog.Navigation.buildSinglePostLink(post.id);
	location.hash = url;
};
Blog.PostData = {};
$(function() {
	Blog.Navigation.wireUpHashChangeListener();
	Blog.Navigation.onHashChange();
});