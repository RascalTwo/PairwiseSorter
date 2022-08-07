import React from 'react';

export default function Card({ header, body, footer}){
	return <div className="col">
		<div className="card text-center" style={{ height: '100%' }}>
			<div className="card-header d-flex justify-content-between align-items-center">
				{header}
			</div>

			<div className="card-body">
				{body}
			</div>

			{footer
				? <div className="card-footer text-muted d-flex justify-content-between align-items-center">
					{footer}
				</div>
				: null
			}
		</div>
	</div>;
}