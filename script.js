// script.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('node-container');
    const svgPath = document.getElementById('curve-path');
    const nodes = Array.from(document.querySelectorAll('.node'));

    // Sort nodes by their intended connection order (data-index)
    nodes.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));

    function drawConnections() {
        if (!container || !svgPath || nodes.length < 2) return;

        const containerRect = container.getBoundingClientRect();

        // Get center points of all nodes
        const points = nodes.map(node => {
            const rect = node.getBoundingClientRect();
            return {
                x: (rect.left + rect.width / 2) - containerRect.left,
                y: (rect.top + rect.height / 2) - containerRect.top
            };
        });

        // Add a starting point off-screen to the left to match the flowing line aesthetic
        const startPoint = {
            x: points[0].x - 150,
            y: points[0].y + 100
        };

        // Complete set of points including dummy start
        const allPoints = [startPoint, ...points];

        // Generate smooth path using basic curve approximation
        let pathD = `M ${allPoints[0].x} ${allPoints[0].y}`;

        for (let i = 0; i < allPoints.length - 1; i++) {
            const current = allPoints[i];
            const next = allPoints[i + 1];

            // To create the looping aesthetic, we exaggerate the control points
            // and alternate their offsets based on index parity to create "curls"

            // Basic cubic bezier control points (midway between points)
            const midX = (current.x + next.x) / 2;
            const midY = (current.y + next.y) / 2;

            // Offset for loops
            const offsetMultiplier = i % 2 === 0 ? 1 : -1;
            const loopExaggeration = 80; // How crazy the loops are

            const cp1x = midX + (Math.abs(next.y - current.y) * 0.3 * offsetMultiplier) + (loopExaggeration * offsetMultiplier);
            const cp1y = current.y + (loopExaggeration * -offsetMultiplier);

            const cp2x = midX - (Math.abs(next.y - current.y) * 0.3 * offsetMultiplier) - (loopExaggeration * offsetMultiplier);
            const cp2y = next.y + (loopExaggeration * offsetMultiplier);

            // Simple smooth curve:
            // pathD += ` C ${current.x + 50} ${current.y} ${next.x - 50} ${next.y} ${next.x} ${next.y}`;

            // Curled smooth curve (more dynamic)
            pathD += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${next.x} ${next.y}`;
        }

        svgPath.setAttribute('d', pathD);

        // Reactivate animation so it re-draws beautifully
        svgPath.style.animation = 'none';
        svgPath.offsetHeight; // trigger reflow
        svgPath.style.animation = null;
    }

    // Initial draw
    // Give images a moment to load so layout doesn't shift
    setTimeout(drawConnections, 100);

    // Redraw on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(drawConnections, 150);
    });

    // Add gentle random floating animation to cards
    nodes.forEach((node, index) => {
        const randomX = (Math.random() - 0.5) * 15;
        const randomY = (Math.random() - 0.5) * 15;
        const duration = 3000 + Math.random() * 2000;

        node.animate([
            { transform: 'translate(0px, 0px)' },
            { transform: `translate(${randomX}px, ${randomY}px)` },
            { transform: 'translate(0px, 0px)' }
        ], {
            duration: duration,
            iterations: Infinity,
            easing: 'ease-in-out'
        });

        // Ensure path stays attached during float
        // (A fully reactive path needs RequestAnimationFrame, but for slight floats, static is fine)
    });
});
