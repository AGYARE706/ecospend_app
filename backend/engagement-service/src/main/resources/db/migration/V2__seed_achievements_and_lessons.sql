-- V2: seed the achievement catalog and starter lesson content. Ported from
-- the mobile app's former client-side constants (ecospend-mobile/src/constants/achievements.ts)
-- plus new lesson-driven achievements, so the catalog is now a single
-- server-owned source of truth.

INSERT INTO achievements (id, title, description, icon, category, target, xp_reward) VALUES
    ('first_goal_achieved', 'First Goal Achieved', 'Complete your first savings goal.', 'flag', 'FINANCE', 1, 50),
    ('first_vault_created', 'First Vault Created', 'Create your first personal vault.', 'lock', 'FINANCE', 1, 50),
    ('first_vault_matured', 'First Vault Matured', 'Reach maturity on a vault for the first time.', 'shield-check', 'FINANCE', 1, 75),
    ('thirty_day_streak', '30-Day Streak', 'Stay active for 30 days.', 'flame', 'STREAK', 30, 150),
    ('hundred_transactions', '100 Transactions Logged', 'Track 100 income or expense transactions.', 'receipt', 'FINANCE', 100, 100),
    ('first_lesson_completed', 'First Lesson Complete', 'Finish your first financial literacy lesson.', 'bulb', 'LESSON', 1, 25),
    ('finance_101_graduate', 'Finance 101 Graduate', 'Complete every lesson across all tracks.', 'trophy', 'LESSON', 12, 200);

INSERT INTO lesson_tracks (id, title, description, icon, sort_order) VALUES
    ('budgeting_basics', 'Budgeting Basics', 'Learn how to plan where your money goes before you spend it.', 'pie-chart', 1),
    ('saving_and_goals', 'Saving & Goals', 'Build the habit of saving and set targets you will actually hit.', 'target', 2),
    ('vaults_and_susu', 'Understanding Vaults & Susu', 'How locked savings and group susu contributions work, and why they help.', 'lock', 3),
    ('smart_spending', 'Smart Spending', 'Spot needless fees and debt traps before they cost you.', 'wallet', 4);

INSERT INTO lessons (id, track_id, title, summary, content, sort_order, xp_reward) VALUES
    ('budgeting_what_is_a_budget', 'budgeting_basics', 'What Is a Budget?',
     'The one-sentence idea behind every budget.',
     'A budget is simply a plan for your money made before you spend it, not a record of what you already spent. Without one, money tends to disappear into small purchases you cannot remember later.

Think of a budget as telling each cedi a job: rent, food, transport, savings. When every cedi has a job, you stop wondering where your money went at the end of the month, because you already decided where it would go at the start.

A budget is not about restriction — it is about intention. It lets you spend freely on what matters to you, because you have already protected the things that matter more.', 1, 20),
    ('budgeting_50_30_20_rule', 'budgeting_basics', 'The 50/30/20 Rule',
     'A simple starting split for your income.',
     'A popular starting point for a first budget: 50% of income to needs (rent, food, transport, bills), 30% to wants (eating out, entertainment), and 20% to savings and debt repayment.

It is a starting ratio, not a law. Someone saving aggressively for a goal might flip it toward 40% savings; someone with high rent might need more than 50% on needs for a while. The value of the rule is that it forces you to look at your spending in three honest buckets instead of one blurry pile.

Once you know your own split, you can decide on purpose whether to change it — instead of discovering it by accident three weeks into the month.', 2, 20),
    ('budgeting_envelopes_in_ecospend', 'budgeting_basics', 'Budget Envelopes, In Practice',
     'How EcoSpend turns the envelope method digital.',
     'The "envelope method" is an old cash-budgeting trick: put a fixed amount of physical cash in an envelope per category, and when the envelope is empty, spending in that category stops for the month.

EcoSpend''s Budget Envelopes feature is the digital version — you set a monthly limit per category (Food, Transport, etc.), and every transaction you record in that category counts against it automatically. You get a warning the moment you reach the limit, the same instant feedback a physical empty envelope gives you.

The habit that makes envelopes work either way is the same: set the limit before the month starts, not after you have already overspent.', 3, 20);

INSERT INTO lessons (id, track_id, title, summary, content, sort_order, xp_reward) VALUES
    ('saving_pay_yourself_first', 'saving_and_goals', 'Pay Yourself First',
     'Why saving should happen before spending, not after.',
     'Most people save whatever is left over at the end of the month — which is usually nothing, because spending naturally expands to fill whatever is available. "Pay yourself first" flips the order: move money into savings the moment you are paid, and spend from what remains.

This is not a trick, it is a sequencing change. The same income, saved in a different order, produces a completely different result, because you are budgeting around a smaller, already-reduced amount rather than hoping for leftovers.

Even a small fixed amount moved first — before rent, before groceries — builds the habit faster than a large amount you plan to save "if there is extra."', 1, 20),
    ('saving_emergency_fund', 'saving_and_goals', 'Your Emergency Fund',
     'The savings goal that protects every other savings goal.',
     'An emergency fund is money set aside only for genuine emergencies — a medical bill, a lost job, an urgent repair — kept separate from your regular spending and other goals.

Its purpose is not to grow, it is to exist. Without one, a single emergency forces you to break a savings goal, sell something, or borrow at a bad rate — undoing months of progress in one bad week.

A common target is 3 months of essential expenses. That can sound large, so start smaller: even a first milestone of one month''s rent already removes the single most common reason savings goals get abandoned.', 2, 20),
    ('saving_smart_goals', 'saving_and_goals', 'Setting Goals You Will Actually Hit',
     'Specific, time-bound goals beat vague ones.',
     '"Save more" is not a goal, because it never finishes and never fails — so it rarely gets acted on. A real savings goal names an amount and a date: GHS 1,000 for a laptop by December, not "save for a laptop eventually."

A specific goal lets you do simple math: GHS 1,000 in 5 months is GHS 200 a month, which is a concrete, checkable weekly or monthly target instead of a vague hope.

When you contribute toward a named goal — and can see the percentage filled — the goal itself becomes motivating, in a way an empty, general-purpose savings balance rarely is.', 3, 20);

INSERT INTO lessons (id, track_id, title, summary, content, sort_order, xp_reward) VALUES
    ('vaults_what_is_a_vault', 'vaults_and_susu', 'What Is a Locked Vault?',
     'Why locking your own money from yourself actually helps.',
     'A locked savings vault holds money you commit not to touch until a chosen future date. It sounds strange to lock money away from yourself, but the whole point is removing the temptation to dip into savings for a non-emergency purchase.

Every time savings are "just sitting there" in a normal, spendable balance, they compete with every future purchase decision. A locked vault removes that competition entirely for the duration of the lock — the money is simply not an option until maturity.

Early withdrawal is usually still possible but comes with a fee, which is intentional: it makes breaking the commitment cost something, the same way a real deadline does.', 1, 20),
    ('vaults_susu_tradition', 'vaults_and_susu', 'Susu: Saving Together',
     'The West African tradition behind group vaults.',
     'Susu is a long-standing West African savings tradition: a group of people contribute a fixed amount on a regular schedule (weekly or monthly) into a shared pool, building savings discipline through group accountability rather than willpower alone.

A group vault is the digital version of a susu group — friends or family set a shared target and contribution schedule, and everyone can see who is on track. Knowing others can see your contribution status is often a stronger motivator than any private savings goal.

The trade-off for that social accountability is commitment: leaving a group vault early, like breaking a personal vault early, typically carries a fee.', 2, 20),
    ('vaults_fees_and_discipline', 'vaults_and_susu', 'Fees Are a Feature, Not a Bug',
     'Why savings products charge you for changing your mind.',
     'A withdrawal fee on a vault can feel like a penalty, but it is doing a specific job: making the "easy" choice (breaking your commitment) slightly costly, so the "hard" choice (waiting) becomes the path of least resistance instead.

Without any friction at all, a locked vault would behave exactly like a normal balance — available the instant you wanted to spend it, which defeats the purpose of locking it in the first place.

The fee is smallest right at maturity and larger for very early withdrawals, precisely to reward patience: a vault broken one week before maturity costs far less than one broken in its first week.', 3, 20);

INSERT INTO lessons (id, track_id, title, summary, content, sort_order, xp_reward) VALUES
    ('spending_needs_vs_wants', 'smart_spending', 'Needs vs. Wants',
     'The first filter for every purchase decision.',
     'A need is something you cannot reasonably avoid: rent, food, transport to work, essential bills. A want is everything else — enjoyable, sometimes worthwhile, but optional in a way needs are not.

The categories blur at the edges (transport is a need; a taxi when a cheaper trotro exists is partly a want), which is exactly why the question is worth asking on purpose rather than assumed. Naming a purchase honestly as a "want" does not mean refusing it — it means choosing it deliberately instead of on autopilot.

Tracking spending by category, the way EcoSpend does automatically, makes this pattern visible over a month instead of one purchase at a time.', 1, 20),
    ('spending_avoiding_debt_traps', 'smart_spending', 'Avoiding Debt Traps',
     'How small, convenient borrowing becomes expensive.',
     'A debt trap is not usually one big bad decision — it is small, convenient borrowing that repeats faster than it gets repaid: a short-term loan to cover a gap, repaid late with a fee, which creates the next month''s gap.

The warning sign is borrowing to cover a *recurring* shortfall rather than a one-time emergency. If the same gap reappears every month, the real problem is the budget, and no amount of borrowing fixes that — it only adds interest on top of it.

The best defense is the emergency fund from the Saving & Goals track: money already set aside for exactly the situations that would otherwise push you toward high-cost borrowing.', 2, 20),
    ('spending_mobile_money_fees', 'smart_spending', 'Mobile Money Fees Add Up',
     'Small percentages, repeated often, become real money.',
     'A mobile money transfer fee of 1% looks negligible on any single transaction, but fees are proportional and frequent — dozens of small transfers a month compound into a real, recurring cost most people never total up.

The fix is not avoiding mobile money, it is batching where possible: one larger transfer costs less in total fees than several small ones covering the same amount, because most fee structures are not perfectly linear at the low end.

This is the same reasoning behind EcoSpend recording a MoMo fee separately on each transaction — seeing the fee as its own line, every time, makes the total genuinely visible instead of quietly absorbed.', 3, 20);

-- 2 quiz questions per lesson, 24 total.
INSERT INTO quiz_questions (lesson_id, question, choices, correct_index, explanation, sort_order) VALUES
    ('budgeting_what_is_a_budget', 'A budget is best described as:', '["A record of what you already spent", "A plan for your money made before you spend it", "A type of bank account", "A monthly bill"]', 1, 'A budget is forward-looking — a plan made before spending happens, not a log after the fact.', 1),
    ('budgeting_what_is_a_budget', 'What does giving every cedi a "job" mean?', '["Only spending on jobs and work-related costs", "Deciding in advance what each part of your income is for", "Investing all your money", "Tracking spending after the month ends"]', 1, 'Assigning every cedi a purpose in advance is what removes the "where did it all go?" feeling at month end.', 2),
    ('budgeting_50_30_20_rule', 'In the 50/30/20 rule, the 20% is for:', '["Wants like entertainment", "Needs like rent", "Savings and debt repayment", "Taxes"]', 2, 'The 20% slice is earmarked for savings and paying down debt.', 1),
    ('budgeting_50_30_20_rule', 'Is the 50/30/20 split a fixed rule everyone must follow?', '["Yes, it is a legal requirement", "No, it is a starting point that can be adjusted to your situation", "Yes, changing it voids your budget", "No, it only applies to businesses"]', 1, 'It is a reasonable starting ratio, not a law — adjust it deliberately once you understand your own numbers.', 2),
    ('budgeting_envelopes_in_ecospend', 'The envelope method traditionally used:', '["Physical cash split into labeled envelopes per category", "A single shared bank account", "Credit cards only", "No budget at all"]', 0, 'The classic envelope method physically separates cash by spending category.', 1),
    ('budgeting_envelopes_in_ecospend', 'In EcoSpend, what happens when a Budget Envelope limit is reached?', '["The app deletes the category", "Nothing, limits are just a suggestion", "You get an alert that the limit was reached", "Your account is locked"]', 2, 'EcoSpend sends a budget alert the moment a category''s spend crosses its monthly limit.', 2),
    ('saving_pay_yourself_first', '"Pay yourself first" means:', '["Spending on yourself before anyone else", "Moving money to savings before spending the rest", "Paying your salary to yourself as a business owner", "Only saving leftover money"]', 1, 'It means saving happens first, and spending is planned around whatever remains.', 1),
    ('saving_pay_yourself_first', 'Why does saving "whatever is left over" usually fail?', '["Banks do not allow it", "Spending tends to expand to use up all available money", "It is illegal in most countries", "Leftover money earns no interest"]', 1, 'Spending naturally expands to fill what is available, so leftovers are often close to zero.', 2),
    ('saving_emergency_fund', 'The main purpose of an emergency fund is to:', '["Grow as fast as possible", "Exist and be available for genuine emergencies", "Replace all other savings goals", "Earn the highest possible interest"]', 1, 'An emergency fund exists to be available when needed — growth is secondary to availability.', 1),
    ('saving_emergency_fund', 'What commonly happens without an emergency fund?', '["Nothing changes", "An emergency forces you to break other savings goals or borrow", "You automatically qualify for a loan", "Your budget becomes simpler"]', 1, 'Without a dedicated fund, emergencies tend to derail other savings goals or force borrowing.', 2),
    ('saving_smart_goals', 'Which is a well-formed savings goal?', '["Save more money", "Save GHS 1,000 for a laptop by December", "Try to save sometimes", "Save whatever is left"]', 1, 'A good goal names a specific amount and a date, making progress checkable.', 1),
    ('saving_smart_goals', 'Why does naming an amount and date help?', '["It lets you compute a concrete monthly target", "It is required by law", "It guarantees the goal will be reached", "It removes the need for a budget"]', 0, 'A specific amount and date lets you divide the goal into a concrete periodic target.', 2),
    ('vaults_what_is_a_vault', 'A locked vault mainly helps by:', '["Earning a guaranteed high interest rate", "Removing the temptation to spend savings before a set date", "Replacing the need for a bank account", "Automatically increasing your income"]', 1, 'Locking removes the money from everyday spending decisions until the chosen date.', 1),
    ('vaults_what_is_a_vault', 'What usually happens if you withdraw from a vault early?', '["Nothing, it is always free", "The vault is deleted permanently", "A fee is typically charged", "Your account tier is downgraded"]', 2, 'Early withdrawal is usually still possible but carries a fee, by design.', 2),
    ('vaults_susu_tradition', 'Susu is best described as:', '["A type of loan", "A West African tradition of group saving on a shared schedule", "A government tax", "A mobile money provider"]', 1, 'Susu is a traditional group-savings practice with scheduled contributions.', 1),
    ('vaults_susu_tradition', 'What makes a group vault motivating for many people?', '["Nobody else can see your progress", "Contributions are optional and invisible", "Other members can see your contribution status", "It pays a fixed salary"]', 2, 'Visibility to the group creates social accountability that a private goal often lacks.', 2),
    ('vaults_fees_and_discipline', 'A vault withdrawal fee mainly serves to:', '["Punish users for saving", "Make breaking your commitment slightly costly, favoring patience", "Fund the company''s profits only", "Discourage all saving"]', 1, 'The fee adds friction to breaking the commitment, nudging behavior toward waiting.', 1),
    ('vaults_fees_and_discipline', 'How does the fee typically change near maturity?', '["It gets larger the closer you get to maturity", "It stays exactly the same the whole time", "It gets smaller the closer you get to maturity", "It disappears immediately after locking"]', 2, 'Fees are usually smallest near maturity, rewarding patience the closer you get.', 2),
    ('spending_needs_vs_wants', 'A "need" is best defined as:', '["Anything you enjoy buying", "Something you cannot reasonably avoid, like rent or food", "Only luxury purchases", "Anything bought with a credit card"]', 1, 'Needs are the essentials you cannot reasonably avoid.', 1),
    ('spending_needs_vs_wants', 'Why bother labeling a purchase as a "want"?', '["To force you to refuse it", "To make the choice deliberate instead of automatic", "Because wants are illegal to track", "It has no real benefit"]', 1, 'Naming it honestly makes the choice conscious, not a refusal.', 2),
    ('spending_avoiding_debt_traps', 'The clearest warning sign of a debt trap is:', '["Borrowing once for a true emergency", "A recurring monthly shortfall covered by repeated borrowing", "Paying a loan off early", "Having zero debt"]', 1, 'A shortfall that repeats every month signals a budget problem borrowing cannot fix.', 1),
    ('spending_avoiding_debt_traps', 'What is the best defense against a debt trap?', '["Borrowing more to cover fees", "An emergency fund set aside in advance", "Ignoring the shortfall", "Opening more loans"]', 1, 'A pre-funded emergency fund removes the need for high-cost borrowing in a crunch.', 2),
    ('spending_mobile_money_fees', 'Why do small mobile money fees matter over time?', '["They are charged only once a year", "They are proportional and repeated often, so they compound", "They are always waived after 10 transfers", "They only apply to businesses"]', 1, 'Frequent small fees add up because they are proportional and repeated regularly.', 1),
    ('spending_mobile_money_fees', 'A practical way to reduce total fees is to:', '["Make many small transfers instead of one large one", "Batch smaller transfers into fewer, larger ones where possible", "Avoid mobile money entirely", "Ignore fees since they are too small to matter"]', 1, 'Batching into fewer, larger transfers usually reduces total fees versus many small ones.', 2);
