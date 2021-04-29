import React from 'react';
import PropTypes from 'prop-types';
//custom hooks
import useTilt from '../../../customHooks/UseTilt';

const Slide = ({ image, title, subtitle, description, offset, isPageBackground }) => {
	const active = offset === 0 ? true : null,
		ref = useTilt(active);

	return (
		<div
			ref={ref}
			className="slide"
			data-active={active}
			style={{
				'--offset': offset,
				'--dir': offset === 0 ? 0 : offset > 0 ? 1 : -1,
			}}
		>
			{isPageBackground && (
				<div
					className="slideBackground"
					style={{
						backgroundImage: `url('${image}')`,
					}}
				/>
			)}
			<div
				className="slideContent"
				style={{
					backgroundImage: `url('${image}')`,
				}}
			>
				<div className="slideContentInner">
					{title && (
						<h2 className="slideTitle" dir="auto">
							{title}
						</h2>
					)}
					{subtitle && (
						<h3 className="slideSubtitle" dir="auto">
							{subtitle}
						</h3>
					)}
					{description && (
						<p className="slideDescription" dir="auto">
							{description}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

Slide.propTypes = {
	image: PropTypes.string.isRequired,
	title: PropTypes.string,
	subtitle: PropTypes.string,
	description: PropTypes.string,
	offset: PropTypes.number.isRequired,
	isPageBackground: PropTypes.bool,
};

export default Slide;
