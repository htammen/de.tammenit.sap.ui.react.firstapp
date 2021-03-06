var FormGroup = ReactBootstrap.FormGroup;
var Label = ReactBootstrap.ControlLabel;
var Input = ReactBootstrap.FormControl;
var Static = ReactBootstrap.FormControl.Static;
var Button = ReactBootstrap.Button;

/*
var testData = [
    { 
      ProductID: 0,
    	ProductName: "Test Product 1",
    	QuantityPerUnit: "100 units per box",
    	UnitPrice: "49.75",
    	Discontinued: false
    },
    { 
      ProductID: 1,
    	ProductName: "Test Product 2",
    	QuantityPerUnit: "20 cases per pallet",
    	UnitPrice: "168.77",
    	Discontinued: false
    },
    { 
      ProductID: 2,
    	ProductName: "Test Product 3",
    	QuantityPerUnit: "20 per box, 20 boxes",
    	UnitPrice: "4953.75",
    	Discontinued: false
    },
    { 
      ProductID: 3,
    	ProductName: "Test Product 4",
    	QuantityPerUnit: "65 individually wrapped",
    	UnitPrice: "112.50",
    	Discontinued: true
    }
];
*/

var FilterEntryBox = React.createClass({
	getInitialState: function() {
		return {
			filterText: "",
		}
	},
	onTextChange: function(event) {
		this.setState({filterText: event.target.value});
		this.props.callback( event.target.value );
	},
	render: function() {
		return(
			<Input type="text" 
				value={this.state.filterText}
				placeholder="Filter Product Name"
				onChange={this.onTextChange}/>
		)
	}
});


var CategoryDisplay = React.createClass({
	getInitialState: function() {
		return {
			categoryCache: [],
			loaded: false,
		};
	},
	componentDidMount: function() {
		var odataUrl = "/Northwind/V3/Northwind/Northwind.svc/";

		$.ajax({
			url: odataUrl + "Categories" ,
			dataType: 'json',
			cache: false
		})
		.done( function( data, textStatus, jqXHR ) {
				this.setState( {
					categoryCache: data.value,
					loaded: true,
				} );
			}.bind(this)
		)
		.fail( function( jqXHR, textStatus, errorThrown ) {
			console.log("Error", jqXHR, textStatus, errorThrown );
			alert( "An error occurred while retrieving the category list from the server: " + textStatus );
		});
	},
	findRow: function( id ) {
		var result = $.grep(this.state.categoryCache, function(e){ return e.CategoryID == id; });
		if ( result.length > 0 ) return result[0].CategoryName;
		else return null;
	},
	render: function() {
		return(
			<span>
				{ this.state.loaded ? this.findRow( this.props.id ) : "...loading..." }
			</span>
		)
	}
})


var AvailableDisplay = React.createClass({
	render: function() {
		return(
			<span className={this.props.value ? "discontinued" : "available"}>
				{this.props.value ? "Discontinued" : "Available"}
			</span>
		)
	}
});

var CurrencyDisplay = React.createClass({
	render: function() {
		var computedPrice = new Number( this.props.value );
		computedPrice = Math.round( computedPrice * 100 )/100;
		computedPrice = computedPrice.toFixed(2).toLocaleString();

		return(
			<span>
				{computedPrice}
				<small className="text-muted"> EUR</small>
			</span>
		)
	}
})

var ModalProductDetail = React.createClass({
	getInitialState: function() {
		return {
			OrderCount: "",
			orderSubmitted: false,
		}	
	},
	onOrderChange: function(event) {
		this.setState({OrderCount: event.target.value});
	},
	onSaveClick: function() {
		this.setState({
			orderSubmitted: true,
		});
		
		setTimeout( this.closeAndReset, 2000 );
	},
	closeAndReset: function() {
		$('#product-detail').modal('hide');
		this.setState({
			orderSubmitted: false,
			OrderCount: "",
		});
	},
	render: function() {
		return (
			<div className="modal fade" tabIndex="-1" role="dialog" id="product-detail">
				<div className="modal-dialog modal-lg" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h4 className="modal-title">Product Details - {this.props.row.ProductName}</h4>
						</div>
						<div className="modal-body">
							{ this.state.orderSubmitted ? <div className="alert alert-success" role="alert">
								<strong>Success!</strong>&nbsp;
								{this.state.OrderCount} units of {this.props.row.ProductName} have been ordered.
							</div> : null }
							<form className="form-horizontal">
								<FormGroup>
									<Label className="col-sm-3">Product Name</Label>
									<Static className="col-sm-9">{this.props.row.ProductName}</Static>
								</FormGroup>
								<FormGroup>
									<Label className="col-sm-3">Unit Price</Label>
									<Static className="col-sm-9">
										<CurrencyDisplay value={this.props.row.UnitPrice} />
									</Static>
								</FormGroup>
								<FormGroup>
									<Label className="col-sm-3">Status</Label>
									<Static className="col-sm-9">
										<AvailableDisplay value={this.props.row.Discontinued} />
									</Static>
								</FormGroup>
								<FormGroup>
									<Label className="col-sm-3">Category</Label>
									<Static className="col-sm-9">
										<CategoryDisplay id={this.props.row.CategoryID} />
									</Static>
								</FormGroup>
								<FormGroup>
									<Label className="col-sm-3">Units In Stock</Label>
									<Static className="col-sm-9">{this.props.row.UnitsInStock}</Static>
								</FormGroup>
								<FormGroup>
									<Label className="col-sm-3">Order Amount</Label>
									<div className="col-sm-6">
										<Input type="number"
												value={this.state.OrderCount}
												placeholder="Number of units to order"
												onChange={this.onOrderChange}
												disabled={this.state.orderSubmitted}/>
									</div>
								</FormGroup>
							</form>
						</div>
						<div className="modal-footer">
							<Button bsStyle="primary" onClick={this.onSaveClick} 
								disabled={this.state.OrderCount == "" || this.state.orderSubmitted}>Save</Button>
							<Button onClick={this.closeAndReset}>Close</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}
});

var TitleBar = React.createClass({
	render: function() {
		return (
			<nav className="navbar navbar-default navbar-fixed-top">
				<div className="container">
					<div className="navbar-header">
						<div className="navbar-brand">Product Overview</div>
					</div>
					<ul className="nav navbar-nav navbar-right">
						<li className="navbar-form form-group">
							<FilterEntryBox callback={this.props.filterCallback} />
						</li>
						<li>
							<p className="navbar-text">Items: {this.props.count}</p>
						</li>
					</ul>
				</div>
			</nav>	
		)	
	}
});

var ListBox = React.createClass({
    render: function() {
        return (
			<button type="button" className="list-group-item" id="product-list" onClick={this.props.clickEvent}>
				<div className="row vertical-align">
					<div className="col-sm-8 top">
					    <h4>{this.props.row.ProductName}</h4>
					    <p> {this.props.row.QuantityPerUnit}</p>
					</div>
					<div className="col-sm-3 text-right top">
					    <h4>
							<CurrencyDisplay value={this.props.row.UnitPrice} />
					    </h4>
						<AvailableDisplay value={this.props.row.Discontinued} />
					</div>
					<div className="col-sm-1 center">
						<span className="glyphicon glyphicon-chevron-right pull-right" aria-hidden="true"></span>
					</div>
				</div>
			</button>
		);
    }
});

var ProductList = React.createClass({
	getInitialState: function() {
	    return {
	    	products: [],
	    	origProducts: [],
	    	selectedRow: null,
	    };
	},

	onListBoxClick: function( row ) {
	    this.setState({selectedRow: row});
	
	    setTimeout( function() {
	    	$('#product-detail').modal("show");
	    });
	},

	componentDidMount: function() {
		var odataUrl = "/Northwind/V3/Northwind/Northwind.svc/";
	
		$.ajax({
			url: odataUrl + "Products" ,
			dataType: 'json',
			cache: false
		})
		.done( function( data, textStatus, jqXHR ) {
				this.setState( {
					products: data.value,
					origProducts: data.value
				} )
			}.bind(this)
		)
		.fail( function( jqXHR, textStatus, errorThrown ) {
			console.log("Error", jqXHR, textStatus, errorThrown );
			alert( "An error occurred while retrieving data from the server: " + textStatus );
		});
	},

	titleBarFilter: function( text ) {
		text = text.toLowerCase();
		if ( text.trim().length > 0 ) {
			var newList = this.state.origProducts.filter( function(row){
				return row.ProductName && row.ProductName.toLowerCase().indexOf( text ) >= 0;
			});
			this.setState({ products : newList });
		}
		else {
			this.setState({ products: this.state.origProducts });
		}
	},

	render: function() {
		//var productListBoxes = testData.map( function(row) {
		var productListBoxes = this.state.products.map( function(row) {
			return(
				<ListBox row={row} key={row.ProductName} clickEvent={this.onListBoxClick.bind(this, row)}/>
			);
		}.bind(this))
	
		console.log(productListBoxes);
	
		return (
			<div>
				<TitleBar count={this.state.products.length} filterCallback={this.titleBarFilter}/>
			    <div className="list-group">
			        {productListBoxes}
			    </div>
				{this.state.selectedRow == null ? null : <ModalProductDetail row={this.state.selectedRow} /> }
			</div>
		)
	}	
});

ReactDOM.render(
    <ProductList />,
    document.getElementById('product-list')
);