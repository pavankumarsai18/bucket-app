'use strict';

/**
 * Dependencies
 */

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import slugify from 'slugg';
import React from 'react';

import BucketBreadcrumb from '../components/bucket-breadcrumb';
import { bucketPath } from '../helpers/urls';
import Actions from '../actions';
import Bucket from '../components/bucket';


/**
 * Bucket page
 */

const BucketPage = React.createClass({
	componentWillMount: function () {
		let actions = this.props.actions;
		let user = this.props.params.user;
		let slug = this.props.params.slug;

		actions.loadBucket({ user, slug }).then(bucket => {
			document.title = bucket.get('name') + ' - Bucket';

			actions.loadBucketRows({
				bucket: bucket.get('id')
			}).then(() => {
				this.unsubscribe = actions.watchBucketRows();
			});
		});

		actions.loadUser(user);
	},

	componentWillUnmount: function () {
		let actions = this.props.actions;

		actions.setBucket(null);
		actions.setBucketRows([]);

		if (this.unsubscribe) {
			this.unsubscribe();
		}
	},

	render: function () {
		let actions = this.props.actions;
		let bucket = this.props.bucket;
		let rows = this.props.rows;
		let user = this.props.user;

		if (!bucket || !user) {
			return <div></div>;
		}

		let authenticatedUser = this.props.authenticatedUser;
		let isReadOnly = !authenticatedUser || authenticatedUser.username !== this.props.params.user;

		let props = {
			readOnly: isReadOnly,
			rows: rows,
			name: bucket.name,
			id: bucket.id,
			onChangeRowOutputType: actions.setBucketRowOutputType,
			onChangeName: this.updateName,
			onDeleteRow: actions.deleteBucketRow,
			onUpdateRow: actions.saveBucketRow,
			onAddRow: actions.createBucketRow,
			onRun: actions.runBucket
		};

		return <div className="container px2 md-px0">
			<BucketBreadcrumb user={ user } bucket={ bucket } />
			<Bucket { ...props } />
		</div>;
	},

	updateName: function (name) {
		let actions = this.props.actions;
		let slug = slugify(name);

		actions.saveBucket({ name, slug });
		actions.transitionTo(bucketPath(this.props.params.user, slug), { replace: true });
	}
});


/**
 * Connect with a store
 */

function mapStateToProps (state) {
	return {
		authenticatedUser: state.authenticatedUser,
		bucket: state.bucket,
		rows: state.rows,
		user: state.user
	};
}

function mapDispatchToProps (dispatch) {
	return {
		actions: bindActionCreators(Actions, dispatch)
	};
}


/**
 * Expose page
 */

export default connect(mapStateToProps, mapDispatchToProps)(BucketPage);
