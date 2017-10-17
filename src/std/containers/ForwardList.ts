/// <reference path="../API.ts" />

namespace std
{
	export class ForwardList<T> implements Iterable<T>
	{
		/**
		 * @hidden
		 */
		private ptr_: IPointer<ForwardList<T>>;

		/**
		 * @hidden
		 */
		private size_: number;

		/**
		 * @hidden
		 */
		private before_begin_: ForwardList.Iterator<T>;

		/**
		 * @hidden
		 */
		private end_: ForwardList.Iterator<T>;

		/* =========================================================
			CONSTRUCTORS & SEMI-CONSTRUCTORS
				- CONSTRUCTORS
				- ASSIGN & CLEAR
		============================================================
			CONSTURCTORS
		--------------------------------------------------------- */
		/**
		 * Default Constructor.
		 */
		public constructor();

		/**
		 * Copy Constructor.
		 * 
		 * @param obj Target container to be copied.
		 */
		public constructor(obj: ForwardList<T>);
		public constructor(n: number, val: T);
		public constructor(first: IForwardIterator<T>, last: IForwardIterator<T>);

		public constructor(...args: any[])
		{
			this.ptr_ = {value: this};

			this.clear();
		}

		/* ---------------------------------------------------------
			ASSIGN & CLEAR
		--------------------------------------------------------- */
		public assign(n: number, val: T): void;
		public assign<T, InputIterator extends IForwardIterator<T>>
			(first: InputIterator, last: InputIterator): void;

		public assign(first: any, last: any): void
		{
			this.clear();

			this.insert_after(this.before_begin_, first, last);
		}

		public clear(): void
		{
			this.end_ = new ForwardList.Iterator<T>(this.ptr_, null, null);
			this.before_begin_ = new ForwardList.Iterator<T>(this.ptr_, this.end_, null);
		}

		/* =========================================================
			ACCESSORS
		========================================================= */
		public size(): number
		{
			return this.size_;
		}
		public empty(): boolean
		{
			return this.size_ == 0;
		}

		public before_begin(): ForwardList.Iterator<T>
		{
			return this.before_begin_;
		}
		public begin(): ForwardList.Iterator<T>
		{
			return this.before_begin_.next();
		}
		public end(): ForwardList.Iterator<T>
		{
			return this.end_;;
		}

		public [Symbol.iterator](): IterableIterator<T>
		{
			return new base.ForOfAdaptor(this.begin(), this.end());
		}

		/* =========================================================
			ELEMENTS I/O
				- INSERT
				- ERASE
				- ALGORITHMS
		============================================================
			INSERT
		--------------------------------------------------------- */
		public push_front(val: T): void
		{
			this.insert_after(this.before_begin_, val);
		}

		public insert_after(pos: ForwardList.Iterator<T>, val: T): ForwardList.Iterator<T>;
		public insert_after(pos: ForwardList.Iterator<T>, n: number, val: T): ForwardList.Iterator<T>;
		public insert_after<T, InputIterator extends IForwardIterator<T>>
			(pos: ForwardList.Iterator<T>, first: InputIterator, last: InputIterator): ForwardList.Iterator<T>;

		public insert_after(pos: ForwardList.Iterator<T>, ...args: any[]): ForwardList.Iterator<T>
		{
			let ret: ForwardList.Iterator<T>;

			// BRANCHES
			if (args.length == 2)
				ret = this._Insert_by_repeating_val(args[0], 1, args[1]);
			else if (args.length == 3 && typeof args[1] == "number")
				ret = this._Insert_by_repeating_val(args[0], args[1], args[2]);
			else
				ret = this._Insert_by_range(args[0], args[1], args[2]);
			
			// RETURNS
			return ret;
		}

		private _Insert_by_repeating_val(pos: ForwardList.Iterator<T>, n: number, val: T): ForwardList.Iterator<T>
		{
			let first: base._Repeater<T> = new base._Repeater<T>(0, val);
			let last: base._Repeater<T> = new base._Repeater<T>(n);

			return this._Insert_by_range(pos, first, last);
		}

		private _Insert_by_range<U extends T, InputIterator extends IForwardIterator<U>>
			(pos: ForwardList.Iterator<T>, first: InputIterator, last: InputIterator): ForwardList.Iterator<T>
		{
			let nodes: ForwardList.Iterator<T>[] = [];
			let count: number = 0;

			for (; !first.equals(last); first = first.next() as InputIterator)
			{
				let node = new ForwardList.Iterator<T>(this.ptr_, null, first.value);
				nodes.push(node);

				++count;
			}
			if (count == 0)
				return pos;

			for (let i: number = 0; i < count - 1; ++i)
				nodes[i]["next_"] = nodes[i + 1];
			nodes[nodes.length - 1]["next_"] = pos.next();
			pos["next_"] = nodes[0];

			this.size_ += count;
			return nodes[nodes.length - 1];
		}

		/* ---------------------------------------------------------
			ERASE
		--------------------------------------------------------- */
		public pop_front(): void
		{
			this.erase_after(this.before_begin());
		}

		public erase_after(it: ForwardList.Iterator<T>): ForwardList.Iterator<T>;

		public erase_after(first: ForwardList.Iterator<T>, last: ForwardList.Iterator<T>): ForwardList.Iterator<T>;

		public erase_after(first: ForwardList.Iterator<T>, last: ForwardList.Iterator<T> = first.advance(2)): ForwardList.Iterator<T>
		{
			// SHRINK SIZE
			this.size_ -= distance(first, last);

			// RE-CONNECT
			first["next_"] = last;
			return last;
		}

		/* ---------------------------------------------------------
			ALGORITHMS
		--------------------------------------------------------- */
		public remove(val: T): void
		{
			this.remove_if(function (elem: T): boolean
				{
					return equal_to(val, elem);
				});
		}

		public remove_if(pred: (val: T) => boolean): void
		{
			for (let it = this.before_begin(); !it.next().equals(this.end()); it = it.next())
				if (pred(it.next().value) == true)
					it["next_"] = it.next().next();
		}

		public sort(): void;
		public sort(comp: (x: T, y: T) => boolean): void;

		public sort(comp: (x: T, y: T) => boolean = less): void
		{
			let vec = new Vector<T>(this.begin(), this.end());
			sort(vec.begin(), vec.end(), comp);

			this.assign(vec.begin(), vec.end());
		}
		
		public reverse(): void
		{
			let vec = new Vector<T>(this.begin(), this.end());
			this.assign(vec.rbegin(), vec.rend());
		}

		public swap(obj: ForwardList<T>): void
		{
			// SIZE AND ITERATORS
			[this.size_, obj.size_] = [obj.size_, this.size_];
			[this.before_begin_, obj.before_begin_] = [obj.before_begin_, this.before_begin_];
			[this.end_, obj.end_] = [obj.before_begin_, this.before_begin_];

			// POINTER OF THE SOURCE
			[this.ptr_, obj.ptr_] = [obj.ptr_, this.ptr_];
			[this.ptr_.value, obj.ptr_.value] = [obj.ptr_.value, this.ptr_.value];
		}
	}
}

namespace std.ForwardList
{
	export class Iterator<T> implements IForwardIterator<T>
	{
		/**
		 * @hidden
		 */
		private source_ptr_: IPointer<ForwardList<T>>;

		/**
		 * @hidden
		 */
		private next_: Iterator<T>;

		/**
		 * @hidden
		 */
		private value_: T;

		/**
		 * Initiailizer Constructor.
		 * 
		 * @param source 
		 * @param next 
		 * @param value 
		 */
		public constructor(source: IPointer<ForwardList<T>>, next: Iterator<T>, value: T)
		{
			this.source_ptr_ = source;
			this.next_ = next;

			this.value_ = value;
		}

		/* ---------------------------------------------------------------
			ACCESSORS
		--------------------------------------------------------------- */
		public source(): ForwardList<T>
		{
			return this.source_ptr_.value;
		}

		public get value(): T
		{
			return this.value_;
		}

		public set value(val: T)
		{
			this.value_ = val;
		}

		/* ---------------------------------------------------------
			MOVERS
		--------------------------------------------------------- */
		public next(): Iterator<T>
		{
			return this.next_;
		}

		public advance(n: number): Iterator<T>
		{
			let ret: Iterator<T> = this;
			for (let i: number = 0; i < n; ++i)
				ret = ret.next();

			return ret;
		}

		/* ---------------------------------------------------------------
			COMPARISON
		--------------------------------------------------------------- */
		public equals(obj: Iterator<T>): boolean
		{
			return this == obj;
		}
	}
}