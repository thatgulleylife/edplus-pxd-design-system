Renders a pill-shaped button. Use for CTAs, nav actions, and links.

```jsx
<Button variant="primary" icon="→">Meet the teams</Button>
<Button variant="maroon" href="/leader">View profile</Button>
<Button variant="ghost" icon="→">Learn more</Button>
<Button variant="soft">See all teams</Button>
```

**Variants:** `primary` (dark), `maroon` (brand gradient), `ghost` (outlined), `soft` (rose tint).
Hover: primary shifts shadow to maroon tint; ghost lifts slightly; all animate on 0.18s ease.
Icon prop renders a trailing element with translateX(4px) on hover.
