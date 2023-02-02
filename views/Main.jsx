import React from 'react';
import NavLink from './components/NavLink';

export default function Main({ version, url, user, message, children }) {
	return (
		<html lang="en">

			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Pairwise Sorter</title>
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.1.3/dist/darkly/bootstrap.min.css" integrity="sha256-VZi/r/RC1MritcGE2Yyxb/ACi8WIOj1Y7BHuslF8+6I=" crossOrigin="anonymous" />
				<link rel="stylesheet" href="/index.css" />
			</head>

			<body>
				<a href="https://github.com/RascalTwo/PairwiseSorter" className="github-corner fixed-top" aria-label="View source on GitHub">
					<svg width="80" height="80" viewBox="0 0 250 250" style={{
						fill: '#70B7FD',
						color: '#fff',
						position: 'absolute',
						top: 0,
						border: 0,
						left: 0,
						transform: 'scale(-1, 1)'
					}} aria-hidden="true">
						<path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
						<path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style={{ transformOrigin: '130px 106px' }} className="octo-arm"></path>
						<path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" className="octo-body"></path>
					</svg>
					<span style={{
						position: 'absolute',
						top: '1.5ch',
						left: '0',
						color: 'black',
						transform: 'rotate(-45deg)',
						fontSize: '.5rem',
					}}>{version}</span>
				</a>
				<style dangerouslySetInnerHTML={{
					__html: '.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0 %, 100 % { transform: rotate(0) }20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github - corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}'
				}} />

				<nav className="navbar navbar-expand-lg bg-dark">
					<div className="container-fluid">
						<a className="navbar-brand ms-5" href="/">Pairwise Sorter</a>
						<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
							<span className="navbar-toggler-icon"></span>
						</button>
						<div className="collapse navbar-collapse" id="navbarNav">
							<ul className="navbar-nav">
								<NavLink url={url} href="/" content="Home" />
								<NavLink url={url} href="/lists" content="Lists" />
								{user.createdAt
									? <>
										<NavLink url={url} href={`/user/${user.username}`} content="Profile" />
										<NavLink url={url} href="/logout" content={`Logout${user.hasOnlyOAuth ? '' : ` of ${user.username}`}`} />
									</>
									: <>
										<NavLink url={url} href="/login" content="Login" />
										<NavLink url={url} href="/signup" content="Sign Up" />
									</>
								}
							</ul>
						</div>
					</div>
				</nav>

				{message
					? <a className="container alert alert-danger position-absolute top-0 start-50" role="alert" href={url}>
						{message}
					</a>
					: null
				}
				<main className="container pt-2">

					{children}

					<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-A3rJD856KowSb7dwlZdYEkO39Gagi7vIsF0jrRAoQmDKKtQBHUuLZ9AsSv4jD4Xa" crossOrigin="anonymous"></script>
					<script src="/jailed/jailed.js"></script>
					<script src="/index.js"></script>
				</main>
			</body>
		</html>
	);
}