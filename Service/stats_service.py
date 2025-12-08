from database import db_connection

class StatsService:
    def __init__(self):
        self.db = db_connection

    def get_user_stats(self, user_id: int):
        cursor = self.db.get_cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM STORY WHERE USER_ID = :1", (user_id,))
            story_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM REVIEW WHERE USER_ID = :1", (user_id,))
            review_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT AVG(RATING) FROM REVIEW WHERE USER_ID = :1", (user_id,))
            avg_rating = cursor.fetchone()[0] or 0
            
            return {
                "user_id": user_id,
                "story_count": story_count,
                "review_count": review_count,
                "average_review_rating": round(float(avg_rating), 2)
            }
        finally:
            cursor.close()

    def get_popular_stories(self, min_likes: int):
        cursor = self.db.get_cursor()
        try:
            cursor.execute("""
                SELECT s.STORY_ID, s.CONTENT, s.LATITUDE, s.LONGITUDE, s.IMAGE_URL, 
                       NVL(s.LIKES, 0) as likes, u.NAME as user_name, s.CREATED_AT
                FROM STORY s
                LEFT JOIN USER_T u ON s.USER_ID = u.USER_ID
                WHERE NVL(s.LIKES, 0) >= :1
                ORDER BY NVL(s.LIKES, 0) DESC
            """, (min_likes,))
            
            stories = []
            for row in cursor:
                content = row[1]
                if hasattr(content, 'read'):
                    content = content.read()
                stories.append({
                    "story_id": row[0],
                    "content": content,
                    "latitude": float(row[2]) if row[2] else None,
                    "longitude": float(row[3]) if row[3] else None,
                    "image_url": row[4],
                    "likes": row[5] or 0,
                    "user_name": row[6],
                    "created_at": row[7].isoformat() if row[7] else None
                })
            return {"stories": stories}
        except Exception as e:
            print(f"Error in get_popular_stories: {e}")
            return {"stories": []}
        finally:
            cursor.close()

    def get_high_rated_places(self, min_rating: float):
        cursor = self.db.get_cursor()
        try:
            cursor.execute("""
                SELECT p.PLACE_ID, p.NAME, p.LATITUDE, p.LONGITUDE, 
                       AVG(r.RATING) as avg_rating, COUNT(r.REVIEW_ID) as review_count
                FROM PLACE p
                INNER JOIN REVIEW r ON p.PLACE_ID = r.PLACE_ID
                GROUP BY p.PLACE_ID, p.NAME, p.LATITUDE, p.LONGITUDE
                HAVING AVG(r.RATING) >= :1
                ORDER BY AVG(r.RATING) DESC
            """, (min_rating,))
            
            places = []
            for row in cursor:
                places.append({
                    "place_id": row[0],
                    "name": row[1],
                    "latitude": float(row[2]) if row[2] else None,
                    "longitude": float(row[3]) if row[3] else None,
                    "average_rating": round(float(row[4]), 2),
                    "review_count": row[5]
                })
            return {"places": places}
        finally:
            cursor.close()

    def search_reviews_by_place(self, place_name: str):
        cursor = self.db.get_cursor()
        try:
            cursor.execute("""
                SELECT r.REVIEW_ID, r.TITLE, r.CONTENT, r.RATING, p.NAME as place_name, r.CREATED_AT
                FROM REVIEW r
                JOIN PLACE p ON r.PLACE_ID = p.PLACE_ID
                WHERE UPPER(p.NAME) LIKE UPPER(:1)
                ORDER BY r.CREATED_AT DESC
            """, (f'%{place_name}%',))
            
            reviews = []
            for row in cursor:
                content = row[2]
                if hasattr(content, 'read'):
                    content = content.read()
                reviews.append({
                    "review_id": row[0],
                    "title": row[1],
                    "content": content,
                    "rating": float(row[3]) if row[3] else 0,
                    "place_name": row[4],
                    "created_at": row[5].isoformat() if row[5] else None
                })
            return {"reviews": reviews}
        finally:
            cursor.close()

    def get_excellent_reviews(self, threshold: float):
        cursor = self.db.get_cursor()
        try:
            cursor.execute("SELECT NVL(AVG(RATING), 0) FROM REVIEW")
            avg_rating = cursor.fetchone()[0] or 0
            
            cursor.execute("""
                SELECT r.REVIEW_ID, r.TITLE, r.CONTENT, r.RATING, p.NAME as place_name, r.CREATED_AT
                FROM REVIEW r
                JOIN PLACE p ON r.PLACE_ID = p.PLACE_ID
                WHERE r.RATING > :1
                ORDER BY r.RATING DESC, r.CREATED_AT DESC
            """, (threshold,))
            
            reviews = []
            for row in cursor:
                content = row[2]
                if hasattr(content, 'read'):
                    content = content.read()
                reviews.append({
                    "review_id": row[0],
                    "title": row[1],
                    "content": content,
                    "rating": float(row[3]) if row[3] else 0,
                    "place_name": row[4],
                    "created_at": row[5].isoformat() if row[5] else None
                })
            return {"average_rating": round(float(avg_rating), 2), "reviews": reviews}
        finally:
            cursor.close()

    def get_hot_reviews(self, place_id: int):
        cursor = self.db.get_cursor()
        try:
            cursor.execute("""
                SELECT r.REVIEW_ID, r.TITLE, r.RATING, COUNT(c.COMMENT_ID) as comment_count, r.CREATED_AT
                FROM REVIEW r
                INNER JOIN COMMENT_T c ON r.REVIEW_ID = c.REVIEW_ID
                WHERE r.PLACE_ID = :1
                GROUP BY r.REVIEW_ID, r.TITLE, r.RATING, r.CREATED_AT
                HAVING COUNT(c.COMMENT_ID) > 0
                ORDER BY comment_count DESC, r.CREATED_AT DESC
            """, (place_id,))
            
            reviews = []
            for row in cursor:
                reviews.append({
                    "review_id": row[0],
                    "title": row[1],
                    "rating": float(row[2]) if row[2] else 0,
                    "comment_count": row[3],
                    "created_at": row[4].isoformat() if row[4] else None
                })
            return {"reviews": reviews}
        finally:
            cursor.close()

    def get_reviews_by_rating(self, rating: float):
        cursor = self.db.get_cursor()
        try:
            cursor.execute("""
                SELECT r.REVIEW_ID, r.TITLE, r.CONTENT, r.RATING, p.NAME as place_name, r.CREATED_AT
                FROM REVIEW r
                JOIN PLACE p ON r.PLACE_ID = p.PLACE_ID
                WHERE r.RATING = :1
                ORDER BY r.CREATED_AT DESC
            """, (rating,))
            
            reviews = []
            for row in cursor:
                content = row[2]
                if hasattr(content, 'read'):
                    content = content.read()
                reviews.append({
                    "review_id": row[0],
                    "title": row[1],
                    "content": content,
                    "rating": float(row[3]) if row[3] else 0,
                    "place_name": row[4],
                    "created_at": row[5].isoformat() if row[5] else None
                })
            return {"reviews": reviews}
        finally:
            cursor.close()

    def search_places_by_name(self, name: str):
        cursor = self.db.get_cursor()
        try:
            cursor.execute("""
                SELECT p.PLACE_ID, p.NAME, p.LATITUDE, p.LONGITUDE, 
                       NVL(AVG(r.RATING), 0) as avg_rating, COUNT(r.REVIEW_ID) as review_count
                FROM PLACE p
                LEFT JOIN REVIEW r ON p.PLACE_ID = r.PLACE_ID
                WHERE UPPER(p.NAME) LIKE UPPER(:1)
                GROUP BY p.PLACE_ID, p.NAME, p.LATITUDE, p.LONGITUDE
                ORDER BY p.NAME
            """, (f'%{name}%',))
            
            places = []
            for row in cursor:
                places.append({
                    "place_id": row[0],
                    "name": row[1],
                    "latitude": float(row[2]) if row[2] else None,
                    "longitude": float(row[3]) if row[3] else None,
                    "average_rating": round(float(row[4]), 2) if row[4] else 0,
                    "review_count": row[5]
                })
            return {"places": places}
        finally:
            cursor.close()
