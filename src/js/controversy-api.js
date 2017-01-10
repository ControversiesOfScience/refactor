export default class controversyAPI {
	constructor() {
		this.url = 'https://worldviewer-test.apigee.net/controversies-of-science/v1/';
		this.cardId = '76b02dc7-d246-11e6-861b-0ad881f403bf'; // Example graphic mock
	}

	init(data) {
		this.card = data;
		this.footnotes = data.footnotes;
		this.slides = data.slides;

		this.impressContainer = document.getElementById('impress');
		this.sideNav = document.getElementById('slide-out');

		this.cardSummary = document.querySelector('.title-box .card-summary');
		this.cardAuthor = document.querySelector('.title-box .card-author');
		this.cardTitle = document.querySelector('.title-box .card-title');
		this.authorAvatar = document.querySelector('.title-box img');
	}

	generateFootnote(selector, markup) {
		let li = document.createElement('li');
		li.innerHTML = markup;
		li.setAttribute('data-slide', selector);
		return li;
	}

	generateSlide(selector, x, y, scale) {
		let div = document.createElement('div');
		div.setAttribute('data-x', x);
		div.setAttribute('data-y', y);
		div.setAttribute('id', selector);
		div.setAttribute('scale', scale);
		return div;
	}

	addMetadataMarkup(resolve, reject) {
		this.cardTitle.innerHTML = this.card.metacard.name;
		this.cardSummary.innerHTML = this.card.metacard.summary;
		this.cardAuthor.innerHTML = this.card.metacard.author.username;
		this.authorAvatar.src = this.card.metacard.author.avatar;

		console.log('pMarkup1');
		resolve();
	}

	addFootnotesMarkup(resolve, reject) {
		this.footnotes.forEach((footnote) => {
			this.sideNav.appendChild(
				this.generateFootnote(
					footnote['selector'],
					footnote['markup']
				)
			);
		});

		console.log('pMarkup2');
		resolve();
	}

	addSlidesMarkup(resolve, reject) {
		this.slides.forEach((slide) => {
			this.impressContainer.appendChild(
				this.generateSlide(
					slide['selector'],
					slide['x'],
					slide['y'],
					slide['scale']
				)
			)
		});

		console.log('pMarkup3');
		resolve();
	}
}
