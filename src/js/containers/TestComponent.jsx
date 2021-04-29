import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
//selectors
import { getTestAction } from '../store/app/selectors/AppSelectors';
//actions
import { setTestAction } from '../store/app/actions/AppActions';

const TestComponent = () => {
	const dispatch = useDispatch(),
		testAction = useSelector((state) => getTestAction({ state }));

	return (
		<div style={{ padding: '4rem 0' }}>
			<div
				className="container"
				style={{
					textAlign: 'center',
					border: '4px dashed red',
					paddingBottom: '1rem',
					margin: '4rem auto',
				}}
			>
				<h3>inner app</h3>
				<p>
					Current environment API of the inner app is <strong>{process.env.API_URL}</strong>
				</p>
				<p>
					Testing the inner app store <strong>{testAction}</strong>
				</p>
				<button className="std-btn primary" onClick={() => dispatch(setTestAction())}>
					Change inner text
				</button>
			</div>
		</div>
	);
};

export default TestComponent;
