<!doctype HTML>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="description" content="." />

		<link rel="stylesheet" href="stylesheets/animations.css" />
		<link rel="stylesheet" href="stylesheets/components.css" />
		<link rel="stylesheet" href="stylesheets/styles.css" />
		<link rel="stylesheet" href="stylesheets/bootstrap-grid.css" />
		<link rel="stylesheet" href="stylesheets/dashed.css" />

		<title>Pio Dashed</title>
	</head>
	<body>
<!-- == ===== 
	== @name X-EXTENSION 
	==
	==
===== == -->
<x-extension id="pio_root_extension" type="startup" class="grid-extension"
	data-base="pio_dashed"
	data-version="1"
    transaction-start="prompt"
    transaction-default-database="pio">
<!-- == ===== 
	== @name X-HEADER 
	==
	==
===== == -->
<x-header id="header" class="header" type="startup" box-shadow>
	<x-peekbox id="console-toolbar" type="startup" mode="default" class="title" edge="top" showing="" cover="" data-local-form="console_format_opts">
		<span>Pio Dashed</span>
		<button class="float-right" onclick="document.getElementById('dashed-prompt').show()">Start Screen</button>
		<button>
			<span>JSON [Data Format]:</span>
		</button>
		<button>
			<span>XML [Markup Format]:</span>
		</button>
		<button>
			<span>Cytoscape [Charts]: </span>
		</button>
		<button>
			<span>Dexie [Database]: </span>
		</button>
	</x-peekbox>
	<x-console id="pio-console" class="active-editor" type="startup" mode="json" data-local-form="console-editor">
		<form id="console-form" method="POST" target="_blank" action="lib/php/xcomponents.php" data-local-form="console_format_opts">
			<fieldset class="console-field">
				<span line="1" class="block">
					<img src="icons/light/dollar-sign.svg" height="15px" width="auto" /> <span>:</span>
					<input class="console-key" placeholder="Property Name" datalist="" />
					<input class="console-value" placeholder="Property Value" style="width:500px;" datalist="" />
					<img src="icons/light/plus.svg" class="fal fa-plus-square" height="15px" width="auto" />
				</span>
			</fieldset>
			<datalist>
				<option></option>
			</datalist>
			<datalist>
				<option></option>
			</datalist>
			<section>
				<input type="submit" name="create" value="Create" />
				<input type="submit" name="update" value="Update" />
				<input type="submit" name="open" value="Open" />
				<input type="button" name="toolbar" value="Toolbar" onclick="document.getElementById('console-toolbar').toggle()" />
			</section>
		</form>
	</x-console>
</x-header>

<!-- == =============== 
	== @name X-BOOK 
	==
	==
=============== == -->
<x-book id="dash_book" pages="3" class="book" type="startup" mode="default">
	<button onclick="active = this.parentNode.querySelector('[active]'); active.active = false; active = active.previousElementSibling.nodeName == 'X-PAGE' ? active.previousElementSibling : this.parentNode.querySelector('[final]'); active.active = true;">Prev Page</button>
	<button onclick="active = this.parentNode.querySelector('[active]'); active.active = false; (active.nextElementSibling || this.nextElementSibling).active = true;">Next Page</button>
 
	<!-- == =============== 
		== @name X-PAGE 
		==
		==
	=============== == -->
	<x-page page-transition="slide-right" transition-exit="slide-down" active selected start="" box-shadow="" page="1">
		<header>
			<h3>Setup Your Content Workspace.</h3>
		</header>
		<section>
			<form>
				<fieldset>
					<legend>Get Started</legend>
					<p>This application is used for content management of data and other resources.</p>
				</fieldset>
			</form>
		</section>
		<footer>
		</footer>
	</x-page>
	 
	<!-- == =============== 
		== @name X-PAGE 
		==
		==
	=============== == -->
	<x-page page-transition="slide-right" id="spread_sheet_page" mode="stamp" page="2" box-shadow="">
		<header>
			<h3>Spreadsheet Editor</h3>
		</header>
		<section id="data-section">
			<x-tabbox tab-position="left" selected-index="0">
				<menu>
					<button data-icon="add" selected>Edit: Add</button>
					<button data-icon="minus">Edit: Remove</button>
					<button data-icon="archive">Edit: Data</button>
				</menu>
				<ul>
					<li selected>
						<div>
						<h4>Edit: Add</h4>
						<form>
							<label>
							<span>Add Columns</span>
							<input type="range" />
							</label>
						</form>
						</div>
					</li>

					<li>
						<div>
						<h4>Edit: Remove</h4>
						<form>
							<label>
								<span>Remove Columns</span>
								<input type="range" />
							</label>
							</form>
						</div>
					</li>

					<li>
				
					</li>
				</ul>
			</x-tabbox>
			<x-table type="cells" mode="default" id="data-sheet" 
				data-columns="3" data-rows="3" table-width="100%" table-height="100%" table-json=""></x-table>
		</section>
		<footer>
		</footer>
	</x-page>
	 
	<!-- == =============== 
		== @name X-PAGE 
		==
		==
	=============== == -->
	<x-page page-transition="slide-right" id="Pio_Dashboard" mode="stamp" page="2" box-shadow>
		<header>
			<h3>JSON Management</h3>
		</header>
		<section>
			<form>
				<fieldset>
					<legend>Get Started</legend>
					<p>This application is used for content management of data and other resources.</p>
				</fieldset>
			</form>
		</section>
		<footer>
		</footer>
	</x-page>
	 
	<!-- == =============== 
		== @name X-PAGE 
		==
		==
	=============== == -->
	<x-page page-transition="slide-right" id="x-physics" page="3" final="" box-shadow="" >
		<header>
			<h3>Physics World Management</h3>
		</header>
		<x-tabbox selected-index="0">
			<menu>
				<button>World Creator</button>
				<button>Open Creation</button>
			</menu>
			<ul>
				<li>
					<h3>World Creator</h3>
				</li>
				<li>
					<h3>Open Creation</h3>
				</li>
			</ul>
		</x-tabbox>
		<footer>
		</footer>
	</x-page>
	 
	<!-- == =============== 
		== @name X-PAGE 
		==
		==
	=============== == -->
	<x-page page-transition="slide-right" id="x-cytoscape" page="4" final="" box-shadow="" >
		<header>
			<h3>Graph Management</h3>
		</header>
		<x-tabbox selected-index="0">
			<menu>
				<button>Create Silo</button>
				<button>Open Silo</button>
				<button>Silo Patterns</button>
				<button>Silo Canvas</button>
			</menu>
			<ul>
				<li>
					<h3>Create Silo</h3>
				</li>
				<li>
					<h3>Available Silos</h3>
				</li>
				<li>
					<h3>Silo Patterns</h3>
				</li>
				<li>
					<h3>Silo Canvas</h3>
				</li>
			</ul>
		</x-tabbox>
		<footer>
			<nav>
				<a href="#">Canva Silos Docs</a>
			</nav>
		</footer>
	</x-page>
</x-book>

<!-- == =============== 
	== @name X-FOOTER  
	==
	==
=============== == -->
<x-footer class="footer" type="startup" mode="default">
	<h3>Data Deck</h3>
	<x-peekbox type="defaultUiEvents" mode="default" showing edge="bottom" cover>
		<div>
			<h3>Pio Dashed Documentation</h3>
			<nav>
				<a href="#">HTML Elements</a>
				<a href="#">Dashboard Framework</a>
				<a href="#">Kippikio Source</a>
				<a href="#">Kippikio Anvil</a>
			</nav>
		</div>
	</x-peekbox>
</x-footer>

<!-- == =============== 
	== @name X-MODAL 
	== @note Add overlay values to the stylesheet so that you can change the look of your modal prompt.
	== @note Add toggling values so that you can transition the toggle behavior.
	== @note Add click hide value so that you can transition the modal prompt hide behavior.
	==
	==
=============== == -->
<x-modal id="dashed-prompt" class="prompt" type="startup" mode="default" data-action="startscreen-form" overlay="" click-hide="">
	<!-- == USER FORM == -->
	<form id="startscreen-form" class="co-form" action="lib/php/setup.php" method="POST" target="_blank">
		<h2>Start Screen</h2>
		<section>
			<h3>Overview</h3>
			<p>Welcome, this dashboard is designed to help you manage your businesses content. It's especially useful for start-ups
			and tinkerers. For more information you can go to our GitHub Wiki.</p>
			<p>Below is a list of resources to help you learn about web technologies and businesses. If you have any resource you'd like to
			have added or are a company who would like to advertise their solution here you can reach the maintainer by leaving an issue on the projects
			GitHub repository labeled as <em>resources</em>.</p>
		</section>
		<h3>Preferences</h3>
		<label class="block">
			<strong>User Name</strong>
			<input type="text" data-icon="user-name" placeholder="[User Name]" />
		</label>
		<section>
			<h4>Set up your landing page.</h4>
			<label class="block">
				<span>Display set up screen when you navigate here?</span>
				<input type="checkbox" name="localDbActive" checked />
			</label>
		</section>
		<label class="block">
			<strong></strong>
			<input type="button" value="Update" />
		</label>
		<!-- == FORM BOOK == -->
		<x-book type="startup" mode="default">
			<input type="button" onclick="active = this.parentNode.querySelector('[active]'); active.active = false; active = active.previousElementSibling.nodeName == 'X-PAGE' ? active.previousElementSibling : this.parentNode.querySelector('[final]'); active.active = true;" value="Prev Page" />
			<input type="button" onclick="active = this.parentNode.querySelector('[active]'); active.active = false; (active.nextElementSibling || this.nextElementSibling).active = true;" value="Next Page" />
			<!-- == USER FORM == -->
			<x-page class="bg-white" page-transition="slide-left" active="">
				<header>
					<h4>Advanced Database</h4>
				</header>
				<section>
					<label class="block">
						<span>Table Creation Wizard: </span>
						<input type="text" data-icon="file-path" placeholder="[File Path]" />
						<input type="button" value="Create Table" target="_blank" name="post-button" />
					</label>
					<label class="block">
						<span>Delete Table</span>
						<input type="text" id="deletion-values" data-icon="file-path" placeholder="[File Path]" />
						<input type="button" id="db_deletion-request" data-fields="deletion-values" data-icon="delete-table" value="Delete Table" />
					</label>
					<label class="block">
						<span>Merge Tables</span>
						<input type="text" data-icon="file-path" placeholder="[File Path]" />
						<input type="button" value="Merge Tables" />
					</label>
				</section>
				<footer>
					<h4>More Options</h4>
				</footer>
			</x-page>
			<x-page class="bg-white" page-transition="slide-left">
				<header>
				<h4>Advanced Console</h4>
				</header>
				<section>

				</section>
				<footer>

				</footer>
			</x-page>
			<x-page class="bg-white" page-transition="slide-left">
				<header>
				<h4>Advanced Themes</h4>
				</header>
				<section>

				</section>
				<footer>

				</footer>
			</x-page>
			<x-page class="bg-white" final="" page-transition="slide-left">
				<header>
				<h4>Advanced Scripts</h4>
				</header>
				<section>

				</section>
				<footer>

				</footer>
			</x-page>
		</x-book>
	</form>
</x-modal>
</x-extension>
		
		<script type="text/javascript" src="lib/javascript/dexie/dist/dexie.js"></script>
		<script type="text/javascript" src="lib/javascript/cytoscape/dist/cytoscape.js"></script>
		<!-- <script type="text/javascript" src="lib/javascript/@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script> -->
		<script type="text/javascript" src="lib/javascript/xtag/dist/x-tag-core.js"></script>
		<script type="text/javascript" src="lib/javascript/xtag/bundles/x-components.js"></script> 
	</body>
</html>






		