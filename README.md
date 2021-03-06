[note, more current and polished version of this is in README.html]

<div>
This is a <b>test</b>.
</div>

# Visualizing an infinite spiral to try to prove the every-lagoon-has-at-most-two-good-exits conjecture.

Priscilla and Dudley take a walk counterclockwise
all the way around the primal and dual perimeter respectively,
in such a way that whenever Priscilla is moving along an edge of the primal,
Dudley is stopped at the corresponding vertex of the dual,
and when Dudley is moving along an edge of the dual,
Priscilla is stopped at the corresponding vertex of the primal.
Exactly one of Priscilla and Dudley are moving at any particular time.

Denote D and P's positions, in rectangular and polar coordinates,
by the following, all continuous functions of time t:

    r_p,theta_p, x_p, y_p
    r_d,theta_d, x_d, y_d

    x_p = r_p cos(theta_p)  y_p = r_p sin(theta_p)
    x_d = r_d cos(theta_d)  y_d = r_d sin(theta_d)

Priscilla's and Dudley's paces are such that the one who's moving
always does so at unit rotation speed around the origin
while the other stays still.
So their positions are continuous piecewise differentiable functions of time,
with

    (d theta_p + d theta_d) / dt = 1 wherever both are differentiable.

Since the combined rotational speed is 1 and the combined rotational distance
is 4 pi, it will take 4 pi units of time for Priscilla and Dudley
to complete one revolution and arrive back at their starting configuration;
if we fix Priscilla's starting point <x_p,y_p>(t=0)
in the interior (not endpoint) of some primal side, this forces Dudley
to start at the dual vertex <x_d,y_d>(t=0)
corresponding to that initial primal edge,
and the entire walk is thus determined.
They will arrive back at <x_p,y_p, x_d,y_d> at time t = 4 pi.

Priscilla and Dudley's walk is defined (modulo the choice of starting point)
no matter what the polygon.
Let's apply it to the case of interest: a polygon
with only one good lagoon exit.
(We'll end up with a contradiction,
showing that, in fact, no single-exit single-polygon lagoon exists.)


Since the primal polygon is bounded by straight lines,
points on the boundary at local maximum and local minimum distance
from the polygon's cc are isolated,
and they alternate, with exactly the same number of local maxima
as local minima.
Furthermore by assumption there's exactly one local maximum
(at some farthest vertex);
therefore there's exactly one local minumum
(somewhere along the nearest side, *not* at a vertex),
which is therefore the unique global minimum.
We'll work in a coordinate system such that the cc
is at the origin <0,0>,
and the nearest point on the perimeter
is one unit below it, at <0,-1>.
For the dual (n another universe, at unrelated scale),
place the central vertex at the origin.
Then the dual edge corresponding to the primal edge closest to the origin
in primal space starts at the origin in dual space
and lies along the -y axis;
choose a scale so that it ends at <0,-1>.
Having chosen the position and scale of the dual,
the entire dual diagram (triangle complex) is thus determined.
It consists of n triangles, each having one vertex at the origin.

We'll number the primal features in CCW order:
primal edges have even indices and primal vertices have odd indices:

    e_0 = the bottom horizontal edge passing through 0,-1
    v_1 = right endpoint of e_0
    e_2 = next edge CCW
    v_3 = next vertex CCW
    ...
    e_{2 n - 2} = edge CW from e_0
    v_{2 n - 1} = left endpoint of e_0

Let m be the (odd) index of the vertex
that is the global maximum distance from the origin
of the entire primal polygon perimeter.
So v_m is the only good exit,
and distance-from=origin is strictly increasing
from <0,-1> around CCW to v_m,
and then strictly decreasing from v_m
back around CCW to <0,-1>.

Consider the directions of the "quill" emanating
from each vertex of this primal polygon.
Since v_m is the only good exit,
every quill *except* the one at v_m
points more towards the origin than away from it
(more precisely, the quill i's direction's dot product
with v_i is < 0), so it can't point directly out from the origin,
it must lean > 90 degrees from that, CW or CCW.
For v_i with i<m, distance from origin to perimeter is increasing,
so the quill at v_i can't lean CCW
(or it would point into the polygon's interior)
so it must lean at least 90 degrees CW from straight out.
Similarly for v_i with i>m, the quill at v_i
must lean at least 90 degrees CCW from straight out.

There is no apparent contradiction in anything described so far;
some plausible cases are shown in Figures 1(a-e).

    Figure 1(a): 212
                         |  
                         *v5
                        / \
                     e6/   \e4
                      /     \
                   v7*       *v3
                    /|       |\
                     |e8   e2| 
                     |       |  
                   v9*---+---*v1
                     |   e0  |
        (XXX Need to tweak it a bit from this to give quills slop)

    Figure 1(b): 112
                    \
                     *v5
                     | \_
                     |   \e4
                     |     \_
                   e6|       *v3
                     |       | \
                     |       |  
                     |       |
                     |       |e2
                     |       |
                     |       |
                     |       |
                   v7*---+---*v1
                     |   e0  |
        (XXX Need to tweak it a bit from this to give quills slop)
        or maybe:
                    \
                     |
                     *v5
                     |\
                     | \
                     |  \
                     |   \e4
                     |    \
                     |     \
                     |      \
                   e6|       *v3
                     |       |  \
                     |       |e2
                     |       |
                   v7*---+---*v1
                     |   e0  |

    Figure 1(c): 013


                         __/
                      __/
                   __*v5
                __/   \
           e6__/       \
          __/           \
                         \e4
                          \
                           \
                            \
                             *v3
                             | \
            __/              |e2
         __/                 |
      v7*---- ... -------+---*v1
 ___/                    e0  |
/

    Figure 1(d): mild spiral
    
    Figure 1(e): steep spiral

Figures 1(a-e) satisfy all the properties
of a single-exit single-polygon lagoon with the cc at the origin,
*except* that when we actually compute the cc,
we'll find it is not at the origin.
We now show that every attempt at a single-exit single-polygon lagoon
is doomed in this way--
that is, given any candidate primal polygon
and a point in its interior such that there is only one good exit
with respect to that point,
that point is *not* the cc of the lagoon.

So, assume we are given such a candidate primal polygon,
and a point in its interior such that there is only one good exit
with respect to that point.
Choose a coordinate system that places that point at the origin,
with the polygon rotated so that v_m (the "apex")
has highest y coordinate,
and slope(e_{m-1}) = -slope(e_{m+1}).
So v_{m-2} is to the lower-left of v_m
and v_{m+2} is to the lower-right of v_m.
e_0 will always be the single edge closest to the origin (though
it need not be horizontal any more).
Figure 2(a-e) shows the same polygons as Figure 1(a-e),
rotated in this way.

We will now show that, in this chosen coordinate system,
the cc's y coordinate is strictly positive,
and so the origin is not the cc.

Let l be the lowest-numbered (most CW) index such that v_{l+2}'s x coord
is <= that of v_l's
(i.e. such that e_{l+1} emerges north or northwest out of v_l).
Let r be the highest-numbered (most CCW) index such that v_{r-1}'s x coord
is >= that of v_r's.

Since e_{l+1} emerges north or northwest from v_l
and the quill at v_l leans CW by more than 90 degrees from outward,
it must be that v_l has positive y coord
(otherwise the angle formed by the quill and e_{l+1}
would be greater than 180 degrees, which is illegal).
Similarly v_r has positive y coord,
and similarly all vertices between them, v_{l+2}, ..., v_{r-2}
have positive y coord as well.

The crux of this proof is to show that the cc of all the vertices
v_1..v_r has positive y coord, or equivalently,
that their moment (cc times total curvature) has positive y coord.

Then by symmetric reasoning,
the cc (or equivalently the moment) of v_l..v{2n-1} also has positive y coord;
furthermore as previously mentioned, each of the vertices v_{l+2}..v_{r-2}
has positive y coord as well, so:

    moment(v_1..v_{2n-1}) = moment(v_1..v_l)
                          + moment(v_{l+2}..v_{r-2})
                          + moment(v_r..v_2n-1)
being the sum of three quantities each with positive y coord,
has positive y coord as well, and we are done.

So, we just need to show that the moment
of the initial vertices v_1..v_l has positive y coord.

We let Priscilla and Dudley compute the moment
by doing their walk around the primal and dual.
Priscilla starts anywhere in the interior of edge e_0
and ends anywhere in the interior of edge e_{l+1}.
Dudley starts and ends at the respective dual vertices.
(XXX maybe call them v'_0 and v'_{l+1}?)

We consider an "event"
to be a moment during the walk
in which one or more of the following happen:
   - Priscilla stops moving and Dudley starts moving
     (the first event is of this type)
   - Dudley stops moving and Priscilla starts moving
   - Dudley crosses the x axis,
     from negative to positive y coordinate
     (this will be a separate event
     iff no dual vertex lies on the x axis).

The accumulated moment vector starts as zero;
at each event at which Dudley has been moving,
Dudley computes the area of the triangle formed by
his previous event position, his current position, and the origin,
and adds

    (Dudley's triangle area)*(Priscilla's position)
to the moment vector being accumulated.


We'll prove the desired result
(that the moment of v_1..v_l has positive y coord)
by inductively proving that a stronger statement holds
at each moment in Priscilla and Dudley's walk.
The desired result follows from the following Lemma's
statement (B) at the end of the walk.
XXX why? need to be more specific

Lemma:
During Priscilla and Dudley walk around the primal (from e_0 to e_{l+1}) and dual
as described above, at all times strictly after the first event:

    (A) 0 < r_m < r_p r_d^2 sin(t_p-t_d) cos(t_p-t_d) / 2
    (B) t_d <  t_m
    (C)     <= t_p
    (D)     <  t_d+pi/2.

Proof:

Note first of all the significance of the "after the first event"
in the Lemma statement.
This clause is necessary because,
up to and including the first event
(Priscilla stopping at v_1 and Dudley starting moving),
r_m = |m| = 0,
and so (A) doesn't hold
(and (B),(C) don't even make sense since t_m isn't even defined).

(XXX this can be moved out of the lemma and proof, it can just be an observation earlier)
In any of Priscilla and Dudley's walks,
convexity of the primal polygon and the fact that it contains the origin
in its interior implies that, at all times,
Priscilla's position vector and her outward normal (right) vector
are strictly within 90 degrees of each other.
In other words (since Priscilla's outward normal vector
is in the direction of Dudley's position vector, by definition)

    (1)    t_d < t_p < t_d+pi/2,
so (D) is always satisfied during any walk on any primal polygon
containing the origin.
We prove the other parts, (A),(B),(C) by induction on the number of events
(as defined earlier) encountered so far.

The base case will be the case when
the number of *previous* events encountered is 1.
(This includes all times strictly after the first event
up to and including the second event.)
That is, Priscilla has stopped moving at v_1 (that was the first event)
and Dudley has been moving along the corresponding edge e'_1 in the dual diagram.
At this time,

    (2)    m = (Dudley's triangle area so far)*(Priscilla's position)
which is a nonzero scalar times the nonzero vector p=v_1,
so

    r_m = |m| > 0
(so the first part of (A) is satisfied, and t_m is well-defined),
and

    t_m = t_p.
Combining this with (1), we have:

    t_d < t_m = t_p < t_d+pi/2
and so (B),(C),(D) are satisfied.
We still have to prove that the second part of (A) holds in the base case.

For this base case,
we temporarily rotate the entire picture
so that Priscilla's position p is on the +y axis,
and so Dudley is traveling upwards along the now-vertical dual edge e'_1,
as shown in Figure 3.
Note that this temporary rotation of the picture
does not change the statement of (A) that we are trying to prove,
since all of the quantities r_m, r_p, r_d, t_p-t_d are invariant
under this rotation
(even though t_p and t_d have changed-- specifically, t_p is now pi/2).
(XXX Alternatively, could denote these rotated coords by carat'ing them)

      Priscilla
       p=v_1*
            :       *v'_2
            :       |
            :     / |
            :       |e'_1
            :    /  |
            :       |  Dudley    ^
            :   /   *d=<x_d,y_d> |
            :      /|            |
            :  /  / | 
            :    /  |  
            : / /  _*v'_0
            :  / _/ :
            ://_/   :
            ://     :
           0*.......* <x_d,0>

        Fig. 3: base case in temporarily rotated coord system


We can get an upper bound on the area of Dudley's triangle so far,
as follows:

    Dudley's triangle area so far
         = areaTri(0,v'_0,d)
         < areaTri(0,<x_d,0>,d) since the former triangle is included in the latter, since v'_0 has y coord > 0 (XXX prove this!)
         = 1/2 x_d y_d
         = 1/2 (r_d cos(t_d)) (r_d sin(t_d))
         = 1/2 (r_d sin(pi/2-t_d)) (r_d cos(pi/2-t_d))
    (3)  = 1/2 r_d^2 sin(pi/2-t_d) cos(pi/2-t_d)

Recalling (2),

      m = (Dudley's triangle area so far)*(Priscilla's position)
        = (Dudley's triangle area so far)*p
Taking magnitude of both sides,

    r_m = r_p * (Dudley's triangle area so far)
        < r_p * (1/2 r_d^2 sin(pi/2-t_d) cos(pi/2-t_d)) by (3)
        = r_p r_d^2 sin(pi/2-t_d) cos(pi/2-t_d) / 2
and so we've shown the second part of (A),
completing the proof of the base case.

For the inductive hypothesis,
assume the statement of the lemma was true
at the (strictly) previous event;
we will show it's true now
(this argument will hold not only when "now" is the following event,
which completes the finite induction,
but also when "now" is between events,
which is needed since the statement of the Lemma is not limited
to just events, it also holds at all times between events.)
Using underbars to denote the respective values
at the previous event (XXX actually in the case of the first event, slightly after it) (XXX actually this is silly, why don't we just make the lemma talk about only events >= 2, I think that will simplify things?)

    _p_ = <_r_p_ cos(_t_p_), _r_p_ sin(_t_p_)>
    _d_ = <_r_d_ cos(_t_d_), _r_d_ sin(_t_d_)>
    _m_ = <_m_p_ cos(_m_p_), _r_p_ sin(_m_p_)>
the inductive hypothesis is:

    (_A_) 0 < _r_m_ < _r_p_ _r_d_^2 sin(_t_p_-_t_d_) cos(_t_p_-_t_d_) / 2
    (_B_) _t_d_ <  _t_m_
    (_C_)       <= _t_p_
    (_D_)       <  _t_d_+pi/2.

There are two cases.

Case 1: In the time since the previous event,
Priscilla has moved (in a straight line) and Dudley has stayed still.

This time we temporarily rotate the picture so that Dudley's position
is on the +x axis,
and so Priscilla is traveling upwards along a now-vertical primal edge,
as shown in Figure 4.
As in the base case, this temporary rotation of the picture
does not change the truth or falsity of the lemma
(even though t_p and t_d have changed-- specifically, t_d is now 0).

            (The following scale looked nice on paper:)
            ....*
            ....|
            ....|
            ....*
            .....
            .....
            *....
                    *p=<x_p,y_p>
                    |
                  . |
                    | ^
                 .  | |
                    | | Priscilla walks from _p_ to p
                .   | | (perpendicular to Dudley's stationary position)
                    | |
               .    | 
                    |  
              .     *_p_=<_x_p_,_y_p_>
                  .  
             .  .    
              .             Dudley
           0*----------------*d=_d_

        Fig. 4: Inductive step, Case 1: Priscilla has moved

In this case we have the following relationships between the previous event's values
and the current values.
Dudley didn't move:

    (5)    r_d = _r_d_
    (6)    t_d = _t_d_ = 0
nor did the moment (since the moment only changes when Dudley moves):

    (7)    r_m = _r_m_
    (8)    t_m = _t_m_ (assuming _t_m_ is well-defined-- which it is, by inductive hypothesis)
Priscilla's angle increased, but stayed less than pi/2:

    (9)    0 < _t_p_ < t_p < pi/2       (XXX do we need to argue that _p_ is strictly positive first?
   (10)    0 < sin(_t_p_) < sin(t_p) < 1    (follows from (9) since sin is increasing in this range)
   (11)    0 < cos(t_p) < cos(_t_p_) < 1    (follows from (9) since cos is decreasing in this range)

Expressing the horizontal distance from the origin to the edge Priscilla is on
in two ways:

         _r_p_ cos(_t_p_) = _x_p_
                          = x_p
                          = r_p cos(t_p)
    (12) _r_p_ cos(_t_p_) = r_p cos(t_p)

Proving (B) is easy:

    t_d = _t_d_  by (6)
        < _t_m_  by (_B_)
        = t_m    by (8).
Proving (C) is easy:

    t_m = _t_m_  by (8)
       <= _t_p_  by (_C_)
        < t_p    by (9)
And (D) is always satisfied (recall it's not part of the induction).

We must prove (A).
The first inequality of (A) is easily proved:

    r_m = _r_m_  by (7)
        > 0 by (_A_)

Proceeding now to prove the second inequality of (A):

    r_m = _r_m_  by (7)
        < _r_p_ _r_d_^2 sin(_t_p_-_t_d_) cos(_t_p_-_t_d_) / 2  by (_A_)
        < _r_p_ r_d^2 sin(_t_p_-_t_d_) cos(_t_p_-_t_d_) / 2  by (5)
        < _r_p_ r_d^2 sin(_t_p_) cos(_t_p_) / 2  since _t_d_=0 in this temporarily rotated picture (XXX maybe use carats instead?)
        = (_r_p_ cos(_t_p_)) r_d^2 sin(_t_p_)/2      (just rearranging terms)
        = (r_p cos(t_p)) r_d^2 sin(_t_p_)/2  by (12)
        < (r_p cos(t_p)) r_d^2 sin(t_p)/2  by (10), since all factors are positive (by (10) and (11))
        = r_p r_d^2 sin(t_p) cos(t_p) / 2  (just rearranging terms)
        = r_p r_d^2 sin(t_p-t_d) cos(t_p-t_d) / 2  since t_d=0 in this rotated picture
and so the second inequality of (A) is proved,
completing Case 1 of the inductive step.



Case 2: In the time since the previous event,
Dudley has moved (in a straight line) and Priscilla has stayed still.

TODO fill this in!



====================================


Lemma:  Given a polygon as previously described,
for each odd i in {1,3,...l},

    XXX MAYBE, but different language
    (C) moment(v_1..v_i) dot (v_{i+2}-v_i) > 0
    (A) ||moment(v_1..v_i)|| < ||v_i|| {r_d}^2 sin(t_p-t_d)     XXX how the fuck did r_d get in here?
    (B) d^perpdot dot moment{v_1..v_i} > 0                              XXX how the fuck did d get in here?  actually need to talk about constructing the dual I think?


