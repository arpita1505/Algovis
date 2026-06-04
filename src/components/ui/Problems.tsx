'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

type Difficulty = 'Easy' | 'Medium' | 'Hard'
type Category = 'Array' | 'String' | 'Tree' | 'Graph' | 'Dynamic Programming' | 'Sorting' | 'Linked List' | 'Stack/Queue' | 'Binary Search' | 'Backtracking' | 'Heap' | 'Math'
type Status = 'unsolved' | 'solved' | 'attempted'

interface Problem {
  id: number
  title: string
  difficulty: Difficulty
  category: Category
  timeComplexity: string
  spaceComplexity: string
  description: string
  hint: string
  approach: string
  leetcode: string
}

const problems: Problem[] = [
  { id:1,  title:'Two Sum',                         difficulty:'Easy',   category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/two-sum/',
    description:'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    hint:'Use a hash map to store each number and its index. For each number, check if its complement (target - num) already exists in the map.',
    approach:'Iterate through the array. For each element x, check if (target - x) exists in a hash map. If yes, return the two indices. If no, add x with its index to the map. This gives O(n) time instead of O(n²) brute force.' },

  { id:2,  title:'Best Time to Buy and Sell Stock', difficulty:'Easy',   category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    description:'You are given an array prices where prices[i] is the price of a stock on day i. You want to maximize profit by choosing a single day to buy and a later day to sell. Return the maximum profit.',
    hint:'Track the minimum price seen so far. At each step, calculate profit if you sold today (price - minPrice).',
    approach:'One pass: keep minPrice = infinity and maxProfit = 0. For each price, update minPrice = min(minPrice, price), then maxProfit = max(maxProfit, price - minPrice). Return maxProfit.' },

  { id:3,  title:'Contains Duplicate',              difficulty:'Easy',   category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/contains-duplicate/',
    description:'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    hint:'Use a hash set. If you encounter a number already in the set, return true.',
    approach:'Add each number to a HashSet. Before adding, check if it already exists. If yes, return true. If loop completes without finding a duplicate, return false.' },

  { id:4,  title:'Maximum Subarray',                difficulty:'Easy',   category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/maximum-subarray/',
    description:'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    hint:'At each position, decide: extend the existing subarray or start a new one from current element. This is Kadane algorithm.',
    approach:'currentSum = max(nums[i], currentSum + nums[i]). maxSum = max(maxSum, currentSum). The key insight: if currentSum becomes negative, it is better to start fresh from the next element.' },

  { id:5,  title:'Product of Array Except Self',    difficulty:'Medium', category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/product-of-array-except-self/',
    description:'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Solve without using division.',
    hint:'Use prefix and suffix products. answer[i] = product of all elements to the left * product of all elements to the right.',
    approach:'First pass left to right: build prefix product array. Second pass right to left: multiply by running suffix product. No division needed, O(1) extra space (not counting output array).' },

  { id:6,  title:'Maximum Product Subarray',        difficulty:'Medium', category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/maximum-product-subarray/',
    description:'Given an integer array nums, find a subarray that has the largest product, and return the product.',
    hint:'Track both maximum and minimum product at each position, because a negative times a negative becomes a positive.',
    approach:'Maintain maxProd and minProd at each step. For each number: new max = max(num, num*maxProd, num*minProd), new min = min(num, num*maxProd, num*minProd). Update answer with maxProd.' },

  { id:7,  title:'Find Minimum in Rotated Sorted Array', difficulty:'Medium', category:'Binary Search', timeComplexity:'O(log n)',    spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    description:'Given a rotated sorted array of unique elements, find the minimum element. You must write an algorithm that runs in O(log n) time.',
    hint:'Use binary search. The minimum is at the inflection point where array goes from large to small.',
    approach:'Binary search: if nums[mid] > nums[right], minimum is in right half (lo = mid+1). Else minimum is in left half including mid (hi = mid). When lo == hi, that is the minimum.' },

  { id:8,  title:'Search in Rotated Sorted Array',  difficulty:'Medium', category:'Binary Search',      timeComplexity:'O(log n)',    spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    description:'Given a rotated sorted array and a target, return the index of target or -1 if not found. Must run in O(log n).',
    hint:'In binary search, determine which half is sorted, then check if target is in that sorted half.',
    approach:'At each step, one half is always sorted. Check if left half is sorted (nums[lo] <= nums[mid]). If target is in that range, search left. Else search right. Same logic for right half.' },

  { id:9,  title:'3Sum',                            difficulty:'Medium', category:'Array',              timeComplexity:'O(n²)',       spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/3sum/',
    description:'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0.',
    hint:'Sort the array. Fix one element and use two pointers for the remaining two.',
    approach:'Sort array. For each element i, use two pointers lo=i+1, hi=n-1. If sum < 0: lo++. If sum > 0: hi--. If sum == 0: add to result and skip duplicates. Skip duplicate values of i too.' },

  { id:10, title:'Container With Most Water',       difficulty:'Medium', category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/container-with-most-water/',
    description:'Given n vertical lines, find two lines that together with the x-axis form a container that contains the most water.',
    hint:'Two pointer approach. Always move the pointer with the shorter line inward.',
    approach:'Start with lo=0, hi=n-1. Calculate area = min(height[lo], height[hi]) * (hi-lo). Update maxArea. Move the pointer with smaller height inward. Repeat until pointers meet.' },

  { id:11, title:'Valid Parentheses',               difficulty:'Easy',   category:'Stack/Queue',        timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/valid-parentheses/',
    description:'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid. Open brackets must be closed by the same type and in the correct order.',
    hint:'Use a stack. Push opening brackets. For closing brackets, check if top of stack matches.',
    approach:'For each character: if opening bracket, push to stack. If closing bracket, check if stack is empty or top does not match. If mismatch return false. At end, stack must be empty.' },

  { id:12, title:'Min Stack',                       difficulty:'Easy',   category:'Stack/Queue',        timeComplexity:'O(1)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/min-stack/',
    description:'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.',
    hint:'Use two stacks: one for values, one for minimums. Push to min stack only when new value is <= current minimum.',
    approach:'Maintain two stacks: stack and minStack. On push: push to stack, push to minStack if value <= minStack.top(). On pop: pop from stack, pop from minStack if popped value == minStack.top().' },

  { id:13, title:'Daily Temperatures',              difficulty:'Medium', category:'Stack/Queue',        timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/daily-temperatures/',
    description:'Given an array of daily temperatures, return an array where answer[i] is the number of days until a warmer temperature. If no future warmer day exists, answer[i] = 0.',
    hint:'Use a monotonic decreasing stack. Store indices, not values.',
    approach:'Maintain a stack of indices. For each day i: while stack not empty and temp[i] > temp[stack.top()], pop index j and set answer[j] = i - j. Push i onto stack. Remaining indices in stack get answer 0.' },

  { id:14, title:'Binary Search',                   difficulty:'Easy',   category:'Binary Search',      timeComplexity:'O(log n)',    spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/binary-search/',
    description:'Given a sorted array of integers and a target, return the index of target or -1 if not found. Must run in O(log n).',
    hint:'Maintain lo and hi pointers. Calculate mid = (lo+hi)/2. Eliminate half based on comparison.',
    approach:'While lo <= hi: mid = lo + (hi-lo)/2. If nums[mid] == target return mid. If nums[mid] < target: lo = mid+1. Else: hi = mid-1. Return -1 if loop ends without finding target.' },

  { id:15, title:'Reverse Linked List',             difficulty:'Easy',   category:'Linked List',        timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/reverse-linked-list/',
    description:'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    hint:'Use three pointers: prev, curr, next. At each step, reverse the link and move forward.',
    approach:'prev=null, curr=head. While curr != null: save next=curr.next, set curr.next=prev, move prev=curr, curr=next. When done, prev is the new head.' },

  { id:16, title:'Merge Two Sorted Lists',          difficulty:'Easy',   category:'Linked List',        timeComplexity:'O(n+m)',      spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/merge-two-sorted-lists/',
    description:'Merge two sorted linked lists and return the head of the merged list. The list should be made by splicing together the nodes of the first two lists.',
    hint:'Use a dummy node to simplify edge cases. Compare heads and attach smaller one.',
    approach:'Create dummy node. Use pointer curr = dummy. While both lists non-null: compare values, attach smaller to curr.next, advance that list pointer and curr. Attach remaining list at end.' },

  { id:17, title:'Reorder List',                    difficulty:'Medium', category:'Linked List',        timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/reorder-list/',
    description:'Reorder list L0 -> L1 -> ... -> Ln-1 -> Ln to L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...',
    hint:'Three steps: find middle, reverse second half, merge two halves.',
    approach:'1) Find middle using slow/fast pointers. 2) Reverse the second half of the list. 3) Merge the two halves by alternating nodes from each.' },

  { id:18, title:'Remove Nth Node From End',        difficulty:'Medium', category:'Linked List',        timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
    description:'Given the head of a linked list, remove the nth node from the end of the list and return its head.',
    hint:'Two pointer technique. Advance fast pointer n steps, then move both until fast reaches end.',
    approach:'Use dummy node. Move fast pointer n+1 steps ahead. Then move both slow and fast until fast is null. Now slow.next is the node to remove. Set slow.next = slow.next.next.' },

  { id:19, title:'Invert Binary Tree',              difficulty:'Easy',   category:'Tree',               timeComplexity:'O(n)',        spaceComplexity:'O(h)',    leetcode:'https://leetcode.com/problems/invert-binary-tree/',
    description:'Given the root of a binary tree, invert the tree, and return its root.',
    hint:'Recursively swap left and right children for every node.',
    approach:'For each node: swap left and right children, then recursively invert both subtrees. Base case: null node returns null. This works both recursively and iteratively with a queue.' },

  { id:20, title:'Maximum Depth of Binary Tree',    difficulty:'Easy',   category:'Tree',               timeComplexity:'O(n)',        spaceComplexity:'O(h)',    leetcode:'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    description:'Given the root of a binary tree, return its maximum depth. Maximum depth is the number of nodes along the longest path from root to the farthest leaf.',
    hint:'Recursively find depth of left and right subtrees. Return 1 + max(left, right).',
    approach:'DFS: return 0 for null node. For each node: return 1 + max(maxDepth(left), maxDepth(right)). Alternatively use BFS and count levels.' },

  { id:21, title:'Same Tree',                       difficulty:'Easy',   category:'Tree',               timeComplexity:'O(n)',        spaceComplexity:'O(h)',    leetcode:'https://leetcode.com/problems/same-tree/',
    description:'Given the roots of two binary trees p and q, write a function to check if they are the same. Two trees are the same if they are structurally identical and the nodes have the same value.',
    hint:'Recursively check: both null (true), one null (false), values differ (false), else check both subtrees.',
    approach:'Base cases: if both null return true, if one null return false, if values differ return false. Recursive case: return isSameTree(p.left, q.left) && isSameTree(p.right, q.right).' },

  { id:22, title:'Subtree of Another Tree',         difficulty:'Easy',   category:'Tree',               timeComplexity:'O(m*n)',      spaceComplexity:'O(h)',    leetcode:'https://leetcode.com/problems/subtree-of-another-tree/',
    description:'Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values as subRoot.',
    hint:'For each node in the main tree, check if it matches the subRoot tree using isSameTree.',
    approach:'isSubtree(root, subRoot): if root is null return false. If isSameTree(root, subRoot) return true. Return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot).' },

  { id:23, title:'Lowest Common Ancestor of BST',   difficulty:'Medium', category:'Tree',               timeComplexity:'O(h)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
    description:'Given a BST, find the lowest common ancestor of two given nodes p and q.',
    hint:'Use BST property. If both values are less than current, go left. If both greater, go right. Otherwise current node is LCA.',
    approach:'Start at root. If p.val < root.val and q.val < root.val: recurse left. If both > root.val: recurse right. Otherwise root is LCA (one is in each subtree or one equals root).' },

  { id:24, title:'Binary Tree Level Order Traversal',difficulty:'Medium',category:'Tree',               timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    description:'Given the root of a binary tree, return the level order traversal of its nodes values (i.e., from left to right, level by level).',
    hint:'Use BFS with a queue. Process all nodes at current level before moving to next.',
    approach:'Use queue starting with root. While queue not empty: record queue size (level size), process exactly that many nodes, add their children to queue. Collect values per level.' },

  { id:25, title:'Validate Binary Search Tree',     difficulty:'Medium', category:'Tree',               timeComplexity:'O(n)',        spaceComplexity:'O(h)',    leetcode:'https://leetcode.com/problems/validate-binary-search-tree/',
    description:'Given the root of a binary tree, determine if it is a valid binary search tree.',
    hint:'Pass valid range (min, max) to each node. Every node must be strictly within its range.',
    approach:'isValid(node, min, max): return true if null. Return false if node.val <= min or node.val >= max. Recurse: isValid(left, min, node.val) && isValid(right, node.val, max).' },

  { id:26, title:'Kth Smallest Element in BST',     difficulty:'Medium', category:'Tree',               timeComplexity:'O(h+k)',      spaceComplexity:'O(h)',    leetcode:'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
    description:'Given the root of a BST and an integer k, return the kth smallest value of all the values in the BST.',
    hint:'Inorder traversal of BST gives elements in sorted order. The kth element visited is the answer.',
    approach:'Perform inorder traversal (left, root, right). Decrement k at each visited node. When k reaches 0, current node is the answer. Can use iterative inorder with stack for O(h+k) space.' },

  { id:27, title:'Construct Binary Tree from Preorder and Inorder', difficulty:'Medium', category:'Tree', timeComplexity:'O(n)',      spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
    description:'Given two integer arrays preorder and inorder where preorder is the preorder traversal and inorder is the inorder traversal, construct and return the binary tree.',
    hint:'First element of preorder is always the root. Find it in inorder to split into left and right subtrees.',
    approach:'Root = preorder[0]. Find root index in inorder. Left subtree has elements inorder[0..rootIdx-1]. Right subtree has inorder[rootIdx+1..n-1]. Recurse with appropriate preorder and inorder slices.' },

  { id:28, title:'Number of Islands',               difficulty:'Medium', category:'Graph',              timeComplexity:'O(m*n)',      spaceComplexity:'O(m*n)',  leetcode:'https://leetcode.com/problems/number-of-islands/',
    description:'Given an m x n 2D binary grid which represents a map of 1s (land) and 0s (water), return the number of islands.',
    hint:'Use DFS/BFS. When you find a 1, increment counter and sink the entire connected island.',
    approach:'Iterate grid. When you find 1, increment count and run DFS to mark all connected 1s as 0 (visited). DFS explores all 4 directions. Continue scanning for remaining unvisited 1s.' },

  { id:29, title:'Clone Graph',                     difficulty:'Medium', category:'Graph',              timeComplexity:'O(V+E)',      spaceComplexity:'O(V)',    leetcode:'https://leetcode.com/problems/clone-graph/',
    description:'Given a reference of a node in a connected undirected graph, return a deep copy of the graph.',
    hint:'Use a hash map to map original nodes to their clones. Use BFS or DFS to traverse.',
    approach:'Use HashMap<Node, Node> mapping original to clone. BFS: for each node, create clone if not exists, then for each neighbor create/get clone and add to cloned node neighbors.' },

  { id:30, title:'Pacific Atlantic Water Flow',     difficulty:'Medium', category:'Graph',              timeComplexity:'O(m*n)',      spaceComplexity:'O(m*n)',  leetcode:'https://leetcode.com/problems/pacific-atlantic-water-flow/',
    description:'Find all cells from which water can flow to both the Pacific and Atlantic oceans.',
    hint:'Reverse the problem: do BFS/DFS from both oceans inward. Find cells reachable from both.',
    approach:'Two BFS/DFS from Pacific border cells and Atlantic border cells. Go uphill (reverse flow). Find intersection of cells reachable from both oceans.' },

  { id:31, title:'Course Schedule',                 difficulty:'Medium', category:'Graph',              timeComplexity:'O(V+E)',      spaceComplexity:'O(V+E)',  leetcode:'https://leetcode.com/problems/course-schedule/',
    description:'There are numCourses courses labeled 0 to n-1. Given prerequisites pairs, determine if you can finish all courses.',
    hint:'This is cycle detection in a directed graph. If there is a cycle, you cannot finish all courses.',
    approach:'Build adjacency list. DFS with 3 states: 0=unvisited, 1=visiting (in current path), 2=visited. If you reach a node with state 1, there is a cycle. Return false.' },

  { id:32, title:'Number of Connected Components', difficulty:'Medium', category:'Graph',               timeComplexity:'O(V+E)',      spaceComplexity:'O(V)',    leetcode:'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/',
    description:'Given n nodes and edges, return the number of connected components in an undirected graph.',
    hint:'Use Union-Find or DFS. Count how many times you start a new DFS from an unvisited node.',
    approach:'DFS approach: for each unvisited node, increment count and run DFS to mark all connected nodes as visited. Union-Find: for each edge, union the two nodes. Count distinct roots.' },

  { id:33, title:'Climbing Stairs',                 difficulty:'Easy',   category:'Dynamic Programming',timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/climbing-stairs/',
    description:'You are climbing a staircase. Each time you can climb 1 or 2 steps. How many distinct ways can you climb n steps?',
    hint:'To reach step n you came from step n-1 or n-2. This is exactly Fibonacci sequence.',
    approach:'dp[i] = dp[i-1] + dp[i-2]. Base cases: dp[1]=1, dp[2]=2. Optimize space by using only two variables prev1 and prev2 instead of full array.' },

  { id:34, title:'House Robber',                    difficulty:'Easy',   category:'Dynamic Programming',timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/house-robber/',
    description:'You are a robber. Adjacent houses cannot be robbed. Given array of house values, return maximum money you can rob without alerting police.',
    hint:'At each house, choose: rob this house + best from i-2, or skip and take best from i-1.',
    approach:'dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Optimize to two variables: prev2=0, prev1=0. For each house: temp=max(prev1, prev2+num), prev2=prev1, prev1=temp.' },

  { id:35, title:'House Robber II',                 difficulty:'Medium', category:'Dynamic Programming',timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/house-robber-ii/',
    description:'Houses are arranged in a circle. Adjacent houses cannot be robbed. First and last house are also adjacent. Return maximum money.',
    hint:'Run House Robber I twice: once on houses[0..n-2] and once on houses[1..n-1]. Take maximum.',
    approach:'Since first and last are adjacent, either rob first or last. Case 1: rob houses[0..n-2]. Case 2: rob houses[1..n-1]. Return max of both cases using House Robber I logic.' },

  { id:36, title:'Longest Palindromic Substring',   difficulty:'Medium', category:'String',             timeComplexity:'O(n²)',       spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/longest-palindromic-substring/',
    description:'Given a string s, return the longest palindromic substring in s.',
    hint:'Expand around center. For each position try odd-length (single center) and even-length (two centers) palindromes.',
    approach:'For each index i, expand around center for both odd and even palindromes. Track best start and end indices. Time O(n²), no extra space. Manacher algorithm can do O(n) but is complex.' },

  { id:37, title:'Palindromic Substrings',           difficulty:'Medium', category:'String',             timeComplexity:'O(n²)',       spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/palindromic-substrings/',
    description:'Given a string s, return the number of palindromic substrings in it.',
    hint:'Same expand-around-center technique. Count each valid palindrome found.',
    approach:'For each center (2n-1 centers for n characters), expand outward while characters match. Count each valid expansion as one palindromic substring. Both odd and even length palindromes.' },

  { id:38, title:'Decode Ways',                     difficulty:'Medium', category:'Dynamic Programming',timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/decode-ways/',
    description:'A message containing letters A-Z can be encoded as 1-26. Given a string of digits, return the number of ways to decode it.',
    hint:'DP similar to climbing stairs. At each position, check if single digit and/or two-digit decode is valid.',
    approach:'dp[i] = ways to decode s[0..i-1]. Single digit: if s[i-1] != 0, dp[i] += dp[i-1]. Two digits: if s[i-2..i-1] is between 10-26, dp[i] += dp[i-2]. Base: dp[0]=1, dp[1]=1 if s[0]!=0.' },

  { id:39, title:'Coin Change',                     difficulty:'Medium', category:'Dynamic Programming',timeComplexity:'O(amount*n)', spaceComplexity:'O(amount)',leetcode:'https://leetcode.com/problems/coin-change/',
    description:'Given coins of different denominations and an amount, return the fewest coins needed to make up that amount. Return -1 if not possible.',
    hint:'dp[i] = minimum coins to make amount i. For each coin, update dp[amount] = min(dp[amount], dp[amount-coin]+1).',
    approach:'Initialize dp[0]=0, rest=infinity. For each amount from 1 to target: for each coin <= amount: dp[amount] = min(dp[amount], dp[amount-coin]+1). Return dp[amount] or -1 if still infinity.' },

  { id:40, title:'Maximum Product Subarray',        difficulty:'Medium', category:'Dynamic Programming',timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/maximum-product-subarray/',
    description:'Given an integer array nums, find a subarray that has the largest product, and return the product.',
    hint:'Track both max and min product because negative * negative = positive.',
    approach:'Maintain curMax and curMin. For each num: new curMax = max(num, num*curMax, num*curMin), new curMin = min(num, num*curMax, num*curMin). Update result with curMax each step.' },

  { id:41, title:'Word Break',                      difficulty:'Medium', category:'Dynamic Programming',timeComplexity:'O(n²)',       spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/word-break/',
    description:'Given a string s and a dictionary wordDict, return true if s can be segmented into a space-separated sequence of dictionary words.',
    hint:'dp[i] = true if s[0..i-1] can be segmented. Check all substrings ending at i.',
    approach:'dp[0] = true. For each i from 1 to n: for each j from 0 to i: if dp[j] is true and s[j..i-1] is in dictionary, set dp[i] = true. Return dp[n].' },

  { id:42, title:'Longest Increasing Subsequence',  difficulty:'Medium', category:'Dynamic Programming',timeComplexity:'O(n log n)',  spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/longest-increasing-subsequence/',
    description:'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    hint:'Use patience sorting with binary search. Maintain a list where each element is the smallest tail of all increasing subsequences of that length.',
    approach:'Maintain tails array. For each num: if num > tails.last(), append it. Else use binary search to find first tail >= num and replace it. Length of tails array is the answer.' },

  { id:43, title:'Unique Paths',                    difficulty:'Medium', category:'Dynamic Programming',timeComplexity:'O(m*n)',      spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/unique-paths/',
    description:'A robot is on an m x n grid at top-left. It can only move right or down. How many unique paths are there to reach the bottom-right corner?',
    hint:'dp[i][j] = dp[i-1][j] + dp[i][j-1]. Optimize to 1D array.',
    approach:'1D DP: initialize dp array of size n with all 1s (top row). For each row i from 1 to m-1: for each col j from 1 to n-1: dp[j] += dp[j-1]. Final answer is dp[n-1].' },

  { id:44, title:'Jump Game',                       difficulty:'Medium', category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/jump-game/',
    description:'Given an integer array nums where nums[i] represents your maximum jump length at that position, return true if you can reach the last index.',
    hint:'Track the farthest reachable index. If current index exceeds it, we are stuck.',
    approach:'Track maxReach = 0. For each index i: if i > maxReach return false (cannot reach here). Update maxReach = max(maxReach, i + nums[i]). If maxReach >= n-1 return true.' },

  { id:45, title:'Merge Intervals',                 difficulty:'Medium', category:'Sorting',            timeComplexity:'O(n log n)',  spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/merge-intervals/',
    description:'Given an array of intervals, merge all overlapping intervals and return an array of non-overlapping intervals.',
    hint:'Sort by start time. If current interval overlaps with last merged, extend the end.',
    approach:'Sort intervals by start. Initialize result with first interval. For each interval: if start <= result.last.end, merge by updating end = max(ends). Otherwise append as new interval.' },

  { id:46, title:'Insert Interval',                 difficulty:'Medium', category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/insert-interval/',
    description:'Given a list of non-overlapping sorted intervals and a new interval, insert and merge the new interval.',
    hint:'Three phases: add all intervals before new one, merge overlapping ones, add remaining.',
    approach:'Phase 1: add all intervals where end < newInterval.start. Phase 2: while start <= newInterval.end, merge by expanding newInterval. Phase 3: add remaining intervals. Insert merged newInterval.' },

  { id:47, title:'Non-overlapping Intervals',       difficulty:'Medium', category:'Sorting',            timeComplexity:'O(n log n)',  spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/non-overlapping-intervals/',
    description:'Given an array of intervals, return the minimum number of intervals you need to remove to make the rest non-overlapping.',
    hint:'Greedy: sort by end time. Keep interval with earliest end if overlap occurs.',
    approach:'Sort by end time. Track end of last kept interval. For each interval: if start >= lastEnd, keep it (update lastEnd). Else remove it (increment count). Returns minimum removals.' },

  { id:48, title:'Meeting Rooms II',                difficulty:'Medium', category:'Heap',               timeComplexity:'O(n log n)',  spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/meeting-rooms-ii/',
    description:'Given an array of meeting time intervals, return the minimum number of conference rooms required.',
    hint:'Use a min-heap of end times. If new meeting starts after earliest ending meeting, reuse that room.',
    approach:'Sort by start time. Min-heap of end times. For each meeting: if heap.top() <= start, pop (reuse room). Push current end time. Answer is heap size at end.' },

  { id:49, title:'Kth Largest Element in Array',    difficulty:'Medium', category:'Heap',               timeComplexity:'O(n log k)',  spaceComplexity:'O(k)',    leetcode:'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    description:'Given an integer array nums and an integer k, return the kth largest element in the array.',
    hint:'Use a min-heap of size k. If heap size exceeds k, remove the minimum. Final heap top is the answer.',
    approach:'Maintain min-heap of size k. For each num: push to heap. If size > k, pop minimum. After all nums, heap.top() is kth largest. Alternatively use QuickSelect for average O(n).' },

  { id:50, title:'Top K Frequent Elements',         difficulty:'Medium', category:'Heap',               timeComplexity:'O(n log k)',  spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/top-k-frequent-elements/',
    description:'Given an integer array nums and an integer k, return the k most frequent elements.',
    hint:'Count frequencies with hash map, then use min-heap of size k or bucket sort.',
    approach:'Count frequencies. Use min-heap of size k: push (freq, num) pairs, pop when size > k. Or use bucket sort: bucket[freq] contains numbers with that frequency, iterate from high to low freq.' },

  { id:51, title:'Find Median from Data Stream',    difficulty:'Hard',   category:'Heap',               timeComplexity:'O(log n)',    spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/find-median-from-data-stream/',
    description:'Design a data structure that supports adding integers and finding the median of current elements.',
    hint:'Use two heaps: max-heap for lower half, min-heap for upper half. Balance them after each insertion.',
    approach:'Max-heap (lower) and min-heap (upper). Add to maxHeap first. Rebalance: if maxHeap.top() > minHeap.top(), move max to minHeap. Ensure sizes differ by at most 1. Median = top of larger heap or average of both tops.' },

  { id:52, title:'Trapping Rain Water',             difficulty:'Hard',   category:'Array',              timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/trapping-rain-water/',
    description:'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
    hint:'Two pointer approach. Water at any position = min(maxLeft, maxRight) - height[i].',
    approach:'Two pointers l=0, r=n-1 with maxLeft and maxRight. If maxLeft < maxRight: water += maxLeft - height[l], l++. Else: water += maxRight - height[r], r--. Always process the side with smaller max.' },

  { id:53, title:'Median of Two Sorted Arrays',     difficulty:'Hard',   category:'Binary Search',      timeComplexity:'O(log(min(m,n)))', spaceComplexity:'O(1)', leetcode:'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    description:'Given two sorted arrays nums1 and nums2 of size m and n, return the median of the two sorted arrays. Must be O(log(m+n)).',
    hint:'Binary search on the smaller array to find the correct partition point.',
    approach:'Binary search on smaller array. Partition both arrays such that left halves combined have (m+n)/2 elements. Check if partition is valid (maxLeft1 <= minRight2 and maxLeft2 <= minRight1). Adjust partition based on this.' },

  { id:54, title:'Word Search',                     difficulty:'Medium', category:'Backtracking',       timeComplexity:'O(m*n*4^L)',  spaceComplexity:'O(L)',    leetcode:'https://leetcode.com/problems/word-search/',
    description:'Given an m x n grid of characters and a string word, return true if word exists in the grid. Word can be constructed from sequentially adjacent cells.',
    hint:'DFS with backtracking. Mark cells visited during search, unmark on return.',
    approach:'For each cell matching word[0], start DFS. In DFS: check bounds and character match, mark cell as visited (e.g. set to #), recurse in 4 directions, unmark on return. This is classic backtracking.' },

  { id:55, title:'Combination Sum',                 difficulty:'Medium', category:'Backtracking',       timeComplexity:'O(n^(t/m))',  spaceComplexity:'O(t/m)',  leetcode:'https://leetcode.com/problems/combination-sum/',
    description:'Given an array of distinct integers candidates and a target, return all unique combinations that sum to target. Same number may be used unlimited times.',
    hint:'Backtracking. For each candidate, include it and recurse with remaining target. Skip when target < 0.',
    approach:'Sort candidates. DFS with (index, current combination, remaining target). At each step: add candidates[i] to combination, recurse with same index (allow reuse) and reduced target. Backtrack by removing last element.' },

  { id:56, title:'Permutations',                    difficulty:'Medium', category:'Backtracking',       timeComplexity:'O(n!)',       spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/permutations/',
    description:'Given an array nums of distinct integers, return all the possible permutations.',
    hint:'Backtracking: swap current position with each remaining position, recurse, then swap back.',
    approach:'Backtrack(start): if start == n, add current array to result. For i from start to n-1: swap nums[start] with nums[i], recurse with start+1, swap back. This generates all n! permutations.' },

  { id:57, title:'Subsets',                         difficulty:'Medium', category:'Backtracking',       timeComplexity:'O(2^n)',      spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/subsets/',
    description:'Given an integer array nums of unique elements, return all possible subsets (the power set).',
    hint:'Backtracking: for each element, choose to include or not include it.',
    approach:'Backtrack(index, current): add current to result. For i from index to n-1: add nums[i] to current, recurse with i+1, remove nums[i]. This generates all 2^n subsets including empty set.' },

  { id:58, title:'Letter Combinations of Phone Number', difficulty:'Medium', category:'Backtracking',   timeComplexity:'O(4^n)',      spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
    description:'Given a string containing digits 2-9, return all possible letter combinations that the number could represent.',
    hint:'Map each digit to its letters. Backtrack by appending each possible letter for current digit.',
    approach:'Map: 2=abc, 3=def, etc. Backtrack(index, current): if index == digits.length, add current to result. For each letter of digits[index]: recurse with index+1 and current+letter.' },

  { id:59, title:'N-Queens',                        difficulty:'Hard',   category:'Backtracking',       timeComplexity:'O(n!)',       spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/n-queens/',
    description:'Place n queens on an n x n chessboard so no two queens attack each other. Return all distinct solutions.',
    hint:'Place one queen per row. Track columns, diagonals and anti-diagonals using sets.',
    approach:'Place queens row by row. For each column in current row: check if column, diagonal (row-col), and anti-diagonal (row+col) are free. If yes, place queen and recurse. Backtrack by removing queen.' },

  { id:60, title:'Minimum Window Substring',        difficulty:'Hard',   category:'String',             timeComplexity:'O(n)',        spaceComplexity:'O(k)',    leetcode:'https://leetcode.com/problems/minimum-window-substring/',
    description:'Given strings s and t, return the minimum window substring of s such that every character in t is included. Return empty string if not possible.',
    hint:'Sliding window with two pointers. Expand right until all chars of t are covered, then shrink left.',
    approach:'Use frequency maps. Expand right pointer, add char to window. When all required chars satisfied (formed == required), try shrinking from left. Update minimum window when valid. Move right when not valid.' },

  { id:61, title:'Longest Substring Without Repeating Characters', difficulty:'Medium', category:'String', timeComplexity:'O(n)', spaceComplexity:'O(min(m,n))', leetcode:'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    description:'Given a string s, find the length of the longest substring without repeating characters.',
    hint:'Sliding window. Move left pointer forward when duplicate is found.',
    approach:'Use hash map to store last index of each character. For each char at right: if char in map and map[char] >= left, update left = map[char]+1. Update map[char]=right. Update maxLen = max(maxLen, right-left+1).' },

  { id:62, title:'Longest Repeating Character Replacement', difficulty:'Medium', category:'String',      timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/longest-repeating-character-replacement/',
    description:'You can replace at most k characters. Find the length of the longest substring containing the same letter you can get after replacements.',
    hint:'Sliding window. Window is valid if (window size - count of most frequent char) <= k.',
    approach:'Use array to count char frequencies in window. Track maxFreq. Window is valid if (right-left+1) - maxFreq <= k. If invalid, shrink left and update counts. Track max valid window size.' },

  { id:63, title:'Group Anagrams',                  difficulty:'Medium', category:'String',             timeComplexity:'O(n*k log k)', spaceComplexity:'O(n*k)', leetcode:'https://leetcode.com/problems/group-anagrams/',
    description:'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    hint:'Anagrams have the same sorted string. Use sorted string as key in a hash map.',
    approach:'For each string: sort its characters to get key. Group strings by this key in a HashMap. Return all values. Alternative: use character count array as key for O(k) instead of O(k log k).' },

  { id:64, title:'Valid Anagram',                   difficulty:'Easy',   category:'String',             timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/valid-anagram/',
    description:'Given two strings s and t, return true if t is an anagram of s.',
    hint:'Count character frequencies. An anagram has the same character counts.',
    approach:'Count frequency of each character in s (increment) and t (decrement). If all counts are 0 at end, they are anagrams. Alternative: sort both strings and compare.' },

  { id:65, title:'Find All Anagrams in String',     difficulty:'Medium', category:'String',             timeComplexity:'O(n)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/find-all-anagrams-in-a-string/',
    description:'Given strings s and p, return all the start indices of anagrams of p in s.',
    hint:'Sliding window of size p.length. Use frequency comparison. Maintain count of matching characters.',
    approach:'Sliding window of fixed size |p|. Track pCount and sCount arrays. Track matches (how many chars have same count). Add right char, remove left char, update matches. When matches==26, found anagram.' },

  { id:66, title:'LRU Cache',                       difficulty:'Medium', category:'Array',              timeComplexity:'O(1)',        spaceComplexity:'O(capacity)', leetcode:'https://leetcode.com/problems/lru-cache/',
    description:'Design a data structure that follows Least Recently Used cache constraints with O(1) get and put operations.',
    hint:'Use HashMap + Doubly Linked List. HashMap for O(1) access, DLL to maintain order.',
    approach:'HashMap maps key to DLL node. DLL: head=most recent, tail=least recent. get: move node to head. put: add to head, if key exists remove old node first, if over capacity remove tail.' },

  { id:67, title:'Encode and Decode Strings',       difficulty:'Medium', category:'String',             timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/encode-and-decode-strings/',
    description:'Design encode and decode functions to serialize a list of strings to a single string and back.',
    hint:'Encode each string as its length followed by a delimiter and the string.',
    approach:'Encode: for each string, append len(s) + "#" + s. Decode: read length until "#", then read exactly that many characters as the next string. Repeat until end of encoded string.' },

  { id:68, title:'Spiral Matrix',                   difficulty:'Medium', category:'Array',              timeComplexity:'O(m*n)',      spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/spiral-matrix/',
    description:'Given an m x n matrix, return all elements in spiral order.',
    hint:'Maintain four boundaries: top, bottom, left, right. Shrink them as you traverse.',
    approach:'Initialize top=0, bottom=m-1, left=0, right=n-1. Loop: traverse right (top row), down (right col), left (bottom row), up (left col). After each direction, shrink the corresponding boundary.' },

  { id:69, title:'Set Matrix Zeroes',               difficulty:'Medium', category:'Array',              timeComplexity:'O(m*n)',      spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/set-matrix-zeroes/',
    description:'Given an m x n matrix, if an element is 0, set its entire row and column to 0. Do it in-place.',
    hint:'Use first row and column as markers. Use two flags for whether first row/col themselves need zeroing.',
    approach:'First pass: mark which rows/cols need zeroing using first row and first col as markers. Second pass: set elements to zero based on markers. Finally handle first row and column using the two flags.' },

  { id:70, title:'Rotate Image',                    difficulty:'Medium', category:'Array',              timeComplexity:'O(n²)',       spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/rotate-image/',
    description:'Given an n x n 2D matrix representing an image, rotate it 90 degrees clockwise in-place.',
    hint:'Two steps: transpose the matrix, then reverse each row.',
    approach:'Step 1: Transpose (swap matrix[i][j] with matrix[j][i] for i<j). Step 2: Reverse each row. These two operations together achieve 90 degree clockwise rotation in O(1) extra space.' },

  { id:71, title:'Word Search II',                  difficulty:'Hard',   category:'Backtracking',       timeComplexity:'O(m*n*4^L)', spaceComplexity:'O(L)',    leetcode:'https://leetcode.com/problems/word-search-ii/',
    description:'Given an m x n board of characters and a list of strings words, return all words on the board.',
    hint:'Build a Trie from all words. DFS on board using the Trie to prune searches early.',
    approach:'Insert all words into Trie. DFS from each cell: if current char not in Trie node children, prune. If Trie node marks end of word, add to result. Mark cells visited during DFS, unmark on backtrack.' },

  { id:72, title:'Alien Dictionary',                difficulty:'Hard',   category:'Graph',              timeComplexity:'O(C)',        spaceComplexity:'O(1)',    leetcode:'https://leetcode.com/problems/alien-dictionary/',
    description:'Given a sorted list of words in an alien language, derive the order of the alphabet.',
    hint:'Build a directed graph from adjacent word comparisons. Topological sort gives the order.',
    approach:'Compare adjacent words to find ordering constraints (first differing character gives an edge). Build directed graph. Topological sort using DFS or BFS (Kahn algorithm). Detect cycles for invalid input.' },

  { id:73, title:'Largest Rectangle in Histogram',  difficulty:'Hard',   category:'Stack/Queue',        timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/largest-rectangle-in-histogram/',
    description:'Given an array of integers heights representing a histogram, return the area of the largest rectangle.',
    hint:'Use a monotonic increasing stack. When we find a shorter bar, calculate areas for all taller bars in stack.',
    approach:'Maintain stack of indices with increasing heights. For each bar: while stack top is taller, pop and calculate area using that height * (current index - stack top - 1). Push current index. Process remaining stack similarly.' },

  { id:74, title:'Binary Tree Maximum Path Sum',    difficulty:'Hard',   category:'Tree',               timeComplexity:'O(n)',        spaceComplexity:'O(h)',    leetcode:'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
    description:'Given the root of a binary tree, return the maximum path sum of any non-empty path.',
    hint:'For each node, consider two things: max path through this node (for updating global max), and max path starting at this node (to return to parent).',
    approach:'DFS returning max gain from each node. At each node: leftGain = max(0, dfs(left)), rightGain = max(0, dfs(right)). Update globalMax = max(globalMax, node.val + leftGain + rightGain). Return node.val + max(leftGain, rightGain).' },

  { id:75, title:'Serialize and Deserialize Binary Tree', difficulty:'Hard', category:'Tree',            timeComplexity:'O(n)',        spaceComplexity:'O(n)',    leetcode:'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
    description:'Design an algorithm to serialize and deserialize a binary tree to/from a string.',
    hint:'Use preorder DFS. Use a special marker for null nodes.',
    approach:'Serialize: preorder DFS, append value or "null" with delimiter. Deserialize: split by delimiter, use queue. Recursively build: pop value, if "null" return null, else create node and recurse for left and right.' },
]

const difficultyColor = (d: Difficulty) => {
  if (d === 'Easy')   return { color: '#15803d', bg: 'rgba(21,128,61,0.08)',   border: 'rgba(21,128,61,0.2)' }
  if (d === 'Medium') return { color: '#d97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)' }
  return                     { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)' }
}

export default function Problems() {
  const [statuses, setStatuses] = useState<Record<number, Status>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem('algovis-problem-statuses')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const [selected, setSelected] = useState<Problem>(problems[0])
  const [filter, setFilter] = useState<'All' | Difficulty>('All')
  const [categoryFilter, setCategoryFilter] = useState<'All' | Category>('All')
  const [showHint, setShowHint] = useState(false)
  const [showApproach, setShowApproach] = useState(false)
  const [search, setSearch] = useState('')

  const toggleStatus = (id: number) => {
    setStatuses(prev => {
      const next = {
        ...prev,
        [id]: prev[id] === 'solved' ? 'unsolved' : prev[id] === 'attempted' ? 'solved' : 'attempted'
      }
      try { localStorage.setItem('algovis-problem-statuses', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const categories: ('All' | Category)[] = ['All','Array','String','Tree','Graph','Dynamic Programming','Sorting','Linked List','Stack/Queue','Binary Search','Backtracking','Heap','Math']

  const filtered = problems.filter(p => {
    const matchDiff = filter === 'All' || p.difficulty === filter
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    return matchDiff && matchCat && matchSearch
  })

  const solved = Object.values(statuses).filter(s => s === 'solved').length
  const attempted = Object.values(statuses).filter(s => s === 'attempted').length
  const easy = problems.filter(p=>p.difficulty==='Easy').length
  const medium = problems.filter(p=>p.difficulty==='Medium').length
  const hard = problems.filter(p=>p.difficulty==='Hard').length

  return (
    <div className="min-h-screen pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-6">
          <h1 className="section-title mb-1">Top DSA Problems</h1>
          <p className="section-subtitle">75 essential interview problems — with problem statement, hints and full approach. Click LeetCode to practice.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {[
            {label:'Solved',    val:solved,    color:'#15803d', bg:'rgba(21,128,61,0.08)'},
            {label:'Attempted', val:attempted, color:'#d97706', bg:'rgba(217,119,6,0.08)'},
            {label:'Total',     val:problems.length, color:'var(--accent-primary)', bg:'var(--highlight)'},
            {label:'Easy',      val:easy,      color:'#15803d', bg:'rgba(21,128,61,0.05)'},
            {label:'Medium',    val:medium,    color:'#d97706', bg:'rgba(217,119,6,0.05)'},
            {label:'Hard',      val:hard,      color:'#dc2626', bg:'rgba(220,38,38,0.05)'},
          ].map(s => (
            <div key={s.label} className="glass-card p-3 text-center" style={{background:s.bg}}>
              <div className="text-xl font-bold mb-0.5" style={{color:s.color,fontFamily:'Inter',letterSpacing:'-0.03em'}}>{s.val}</div>
              <div className="text-xs" style={{color:'var(--text-muted)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* Problem list */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <div className="glass-card p-3 flex flex-col gap-2">
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search problems..."
                style={{width:'100%',padding:'7px 12px',borderRadius:'7px',background:'var(--bg-input)',border:'1px solid var(--border)',color:'var(--text-primary)',fontFamily:'Inter',fontSize:'13px',outline:'none'}} />
              <div className="flex gap-1 flex-wrap">
                {(['All','Easy','Medium','Hard'] as ('All'|Difficulty)[]).map(d => (
                  <button key={d} onClick={()=>setFilter(d)}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                    style={{background:filter===d?(d==='Easy'?'#15803d':d==='Medium'?'#d97706':d==='Hard'?'#dc2626':'var(--accent-primary)'):'var(--bg-secondary)',color:filter===d?'#fff':'var(--text-muted)',border:'1px solid var(--border)',fontFamily:'Inter',cursor:'pointer'}}>
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 flex-wrap">
                {categories.slice(0,8).map(c => (
                  <button key={c} onClick={()=>setCategoryFilter(c)}
                    className="text-xs px-2 py-0.5 rounded-full transition-all"
                    style={{background:categoryFilter===c?'var(--highlight)':'transparent',color:categoryFilter===c?'var(--accent-primary)':'var(--text-faint)',border:categoryFilter===c?'1px solid var(--border)':'1px solid transparent',fontFamily:'Inter',cursor:'pointer'}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1" style={{maxHeight:'560px',overflowY:'auto'}}>
              {filtered.map(p => {
                const dc = difficultyColor(p.difficulty)
                const status = statuses[p.id] || 'unsolved'
                return (
                  <button key={p.id} onClick={()=>{ setSelected(p); setShowHint(false); setShowApproach(false) }}
                    className="glass-card p-3 text-left flex items-center gap-2 transition-all"
                    style={{border:selected.id===p.id?'1px solid var(--accent-primary)':'1px solid var(--border-subtle)',background:selected.id===p.id?'var(--highlight)':undefined,cursor:'pointer'}}>
                    <button onClick={e=>{e.stopPropagation();toggleStatus(p.id)}}
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{background:status==='solved'?'#15803d':status==='attempted'?'#d97706':'var(--bg-secondary)',color:'#fff',border:'1px solid var(--border)',cursor:'pointer',flexShrink:0}}>
                      {status==='solved'?'✓':status==='attempted'?'~':''}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" style={{color:selected.id===p.id?'var(--accent-primary)':'var(--text-primary)',fontFamily:'Inter'}}>{p.id}. {p.title}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{background:dc.bg,color:dc.color,border:'1px solid '+dc.border,fontSize:'10px',fontWeight:600}}>{p.difficulty}</span>
                        <span style={{color:'var(--text-faint)',fontSize:'10px'}}>{p.category}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-center py-8" style={{color:'var(--text-faint)',fontSize:'13px'}}>No problems match your filters</div>
              )}
            </div>
          </div>

          {/* Problem detail */}
          <div className="md:col-span-3">
            <motion.div key={selected.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="glass-card p-6">

              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex-1">
                  <div className="text-lg font-semibold mb-2 tracking-tight" style={{color:'var(--text-primary)',fontFamily:'Inter',letterSpacing:'-0.02em'}}>
                    {selected.id}. {selected.title}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => { const dc=difficultyColor(selected.difficulty); return (
                      <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{background:dc.bg,color:dc.color,border:'1px solid '+dc.border}}>{selected.difficulty}</span>
                    )})()}
                    <span className="tag">{selected.category}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a href={selected.leetcode} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary text-xs py-1.5 px-3 no-underline"
                    style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'4px'}}>
                    <span>🔗</span> LeetCode
                  </a>
                  <button onClick={()=>toggleStatus(selected.id)}
                    className="btn text-xs py-1.5 px-3"
                    style={{background:(statuses[selected.id]||'unsolved')==='solved'?'#15803d':(statuses[selected.id]||'unsolved')==='attempted'?'#d97706':'var(--bg-secondary)',color:(statuses[selected.id]||'unsolved')==='unsolved'?'var(--text-muted)':'#fff',border:'1px solid var(--border)',cursor:'pointer'}}>
                    {(statuses[selected.id]||'unsolved')==='solved'?'✓ Solved':(statuses[selected.id]||'unsolved')==='attempted'?'~ Attempted':'Mark solved'}
                  </button>
                </div>
              </div>

              {/* Complexity */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[{label:'Time',val:selected.timeComplexity,color:'var(--accent-primary)'},{label:'Space',val:selected.spaceComplexity,color:'#7c3aed'}].map(item=>(
                  <div key={item.label} className="p-2.5 rounded-lg" style={{background:'var(--bg-secondary)',border:'1px solid var(--border-subtle)'}}>
                    <div className="text-xs mb-0.5" style={{color:'var(--text-faint)'}}>{item.label} Complexity</div>
                    <div className="text-sm font-bold" style={{color:item.color,fontFamily:'JetBrains Mono, monospace'}}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Problem description */}
              <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'var(--bg-secondary)',border:'1px solid var(--border-subtle)',color:'var(--text-secondary)',lineHeight:1.75,fontFamily:'Inter'}}>
                {selected.description}
              </div>

              {/* Hint */}
              <div className="mb-2">
                <button onClick={()=>{setShowHint(!showHint);setShowApproach(false)}}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-all"
                  style={{background:showHint?'rgba(37,99,235,0.06)':'var(--bg-secondary)',border:'1px solid '+(showHint?'var(--accent-primary)':'var(--border-subtle)'),cursor:'pointer'}}>
                  <span className="text-sm font-medium" style={{color:showHint?'var(--accent-primary)':'var(--text-muted)',fontFamily:'Inter'}}>💡 {showHint?'Hide hint':'Show hint'}</span>
                  <span style={{color:'var(--text-faint)',fontSize:'18px'}}>{showHint?'−':'+'}</span>
                </button>
                {showHint && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}}
                    className="p-3 mt-1 rounded-lg text-sm" style={{background:'rgba(37,99,235,0.04)',border:'1px solid var(--border)',color:'var(--text-secondary)',lineHeight:1.75,fontFamily:'Inter'}}>
                    {selected.hint}
                  </motion.div>
                )}
              </div>

              {/* Approach */}
              <div>
                <button onClick={()=>{setShowApproach(!showApproach);setShowHint(false)}}
                  className="w-full flex items-center justify-between p-3 rounded-lg transition-all"
                  style={{background:showApproach?'rgba(124,58,237,0.06)':'var(--bg-secondary)',border:'1px solid '+(showApproach?'#7c3aed':'var(--border-subtle)'),cursor:'pointer'}}>
                  <span className="text-sm font-medium" style={{color:showApproach?'#7c3aed':'var(--text-muted)',fontFamily:'Inter'}}>🧠 {showApproach?'Hide approach':'Show full approach'}</span>
                  <span style={{color:'var(--text-faint)',fontSize:'18px'}}>{showApproach?'−':'+'}</span>
                </button>
                {showApproach && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}}
                    className="p-3 mt-1 rounded-lg text-sm" style={{background:'rgba(124,58,237,0.04)',border:'1px solid var(--border)',color:'var(--text-secondary)',lineHeight:1.8,fontFamily:'Inter'}}>
                    {selected.approach}
                  </motion.div>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
