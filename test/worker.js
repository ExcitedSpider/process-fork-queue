const randomWorkTime = Math.round(Math.random() * 2000 + 500);

async function main() {
  await new Promise((res) => setTimeout(res, randomWorkTime));
}

console.log("[start]", process.argv[2], "for", randomWorkTime, "ms");
main().then(() => {
  console.log("[end]", process.argv[2], "for", randomWorkTime, "ms");
});
