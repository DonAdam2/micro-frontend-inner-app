import React, { useState } from 'react';
import PropTypes from 'prop-types';
//font awesome
/*import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/pro-solid-svg-icons';*/
//components
import Slide from './Slide';

const Carousel = ({ slides, isPageBackground }) => {
	const [slideIndex, setSlideIndex] = useState(0);

	const handlePrevSlide = () => {
		setSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
	};

	const handleNextSlide = () => {
		setSlideIndex((prev) => (prev + 1) % slides.length);
	};

	return (
		<section className="slidesWrapper">
			<div className="slides">
				<button className="prevSlideBtn" onClick={handlePrevSlide}>
					{/*<FontAwesomeIcon icon={faChevronLeft} />*/}
					Prev
				</button>

				{[...slides, ...slides, ...slides].map((slide, i) => {
					let offset = slides.length + (slideIndex - i);

					if (typeof slide === 'string') {
						return (
							<Slide image={slide} offset={offset} isPageBackground={isPageBackground} key={i} />
						);
					} else {
						return (
							<Slide
								image={slide.image}
								title={slide.title}
								subtitle={slide.subtitle}
								description={slide.description}
								offset={offset}
								isPageBackground={isPageBackground}
								key={i}
							/>
						);
					}
				})}
				<button className="nextSlideBtn" onClick={handleNextSlide}>
					{/*<FontAwesomeIcon icon={faChevronRight} />*/}
					Next
				</button>
			</div>
		</section>
	);
};

Carousel.propTypes = {
	slides: PropTypes.array.isRequired,
	isPageBackground: PropTypes.bool,
};

export default Carousel;
