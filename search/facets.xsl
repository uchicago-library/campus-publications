<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="docHit"/>
<xsl:template match="parameters"/>
<xsl:template match="query"/>

<xsl:key name="display-title" match="//docHit" use="meta/display-title"/>

<!-- Check to see how many different titles are in search results. -->
<xsl:variable name="numberoftitles" select="
	count(
		//docHit[
			generate-id(.) = generate-id(key('display-title', meta/display-title)[1])])
"/>

<!-- / -->

<xsl:template match="/">
<xsl:choose>
	<!--	
		If there is only one parameter like "f1-title", go into
		single-item mode.
	-->
	<xsl:when test="$numberoftitles = 1">
		<xsl:apply-templates select="/crossQueryResult/facet[@field='facet-title']" mode="thisitem"/>
	</xsl:when>
	<xsl:otherwise>
		<xsl:apply-templates select="/crossQueryResult/facet[@field='facet-category-student']"/>
		<xsl:apply-templates select="/crossQueryResult/facet[@field='facet-category-university']"/>
	</xsl:otherwise>
</xsl:choose>
<xsl:apply-templates select="/crossQueryResult/facet[@field='facet-date']"/>
<!--	
	If there is only one parameter like "f1-title", do a volume facet.
-->
<xsl:if test="$numberoftitles = 1">
	<xsl:apply-templates select="/crossQueryResult/facet[@field='facet-volume']"/>
</xsl:if>
</xsl:template>

<!-- FACET: SINGLE ITEM MODE -->

<xsl:template match="facet" mode="thisitem">
	<h2>Search within:</h2>
	<p><strong><xsl:value-of select="substring-before(//docHit/meta/facet-title, '::')"/></strong></p>

	<form>
		<input class="span3" name="keyword" type="text"/>
		<input name="f1-title" type="hidden" value="{substring-after(//docHit[1]/meta/facet-category/text(), '::')}"/>
		<xsl:if test="/crossQueryResult/parameters/param[@name='f1-date']">
			<input name="f1-date" type="hidden" value="{/crossQueryResult/parameters/param[@name='f1-date']/@value}"/>
		</xsl:if>
	</form>
</xsl:template>

<!-- FACET -->

<xsl:template match="facet[group]">
<h2>
<xsl:if test="@field = 'facet-category-student'">Student Publications</xsl:if>
<xsl:if test="@field = 'facet-category-university'">University Publications</xsl:if>
<xsl:if test="@field = 'facet-volume'">Volumes</xsl:if>
</h2>
<ul><xsl:apply-templates/></ul>
</xsl:template>

<!-- GROUP -->

<xsl:template match="group">
<!--
Get the name of the url param. Turn things into f1-title if necessary.
-->
<xsl:variable name="name">
	<xsl:choose>
		<xsl:when test="
			parent::facet/@field='facet-category-student' or
			parent::facet/@field='facet-category-university'
		">
			<xsl:value-of select="'f1-title'"/>
		</xsl:when>
		<xsl:when test="
			parent::facet/@field='facet-date'
		">
			<xsl:value-of select="'f1-date'"/>
		</xsl:when>
		<xsl:when test="
			parent::facet/@field='facet-volume'
		">
			<xsl:value-of select="'f1-volume'"/>
		</xsl:when>
	</xsl:choose>
</xsl:variable>
<xsl:variable name="value">
<xsl:choose>
	<xsl:when test="ancestor::facet/@field='facet-volume'">
		<xsl:value-of select="concat('Vol. ', number(@value))"/>
	</xsl:when>
	<xsl:when test="parent::group/parent::group/parent::group/parent::facet">
		<xsl:value-of select="number(@value)"/>
	</xsl:when>
	<xsl:when test="parent::group/parent::group/parent::facet">
		<xsl:if test="@value = '01'">January</xsl:if>
		<xsl:if test="@value = '02'">February</xsl:if>
		<xsl:if test="@value = '03'">March</xsl:if>
		<xsl:if test="@value = '04'">April</xsl:if>
		<xsl:if test="@value = '05'">May</xsl:if>
		<xsl:if test="@value = '06'">June</xsl:if>
		<xsl:if test="@value = '07'">July</xsl:if>
		<xsl:if test="@value = '08'">August</xsl:if>
		<xsl:if test="@value = '09'">September</xsl:if>
		<xsl:if test="@value = '10'">October</xsl:if>
		<xsl:if test="@value = '11'">November</xsl:if>
		<xsl:if test="@value = '12'">December</xsl:if>
	</xsl:when>
	<xsl:otherwise>
		<xsl:value-of select="@value"/>
	</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="url">
	<xsl:apply-templates select="/" mode="url">
		<xsl:with-param name="name" select="$name"/>
		<xsl:with-param name="value" select="@value"/>
	</xsl:apply-templates>
</xsl:variable>
<li>
	<xsl:choose>
		<xsl:when test="
			(parent::facet/@field = 'facet-date' or
			parent::facet/@field = 'facet-volume') and
			parent::facet/@totalGroups = '1'
		">
			<xsl:value-of select="$value"/>
			<xsl:text> </xsl:text>
			<span class="facetcount">(<xsl:value-of select="@totalDocs"/>)</span>
		</xsl:when>
		<xsl:otherwise>
			<a href="{$url}">
				<xsl:value-of select="$value"/>
			</a>
			<xsl:text> </xsl:text>
			<span class="facetcount">(<xsl:value-of select="@totalDocs"/>)</span>
		</xsl:otherwise>
	</xsl:choose>
</li>
</xsl:template>

<!-- FACET: FACET-CATEGORY-STUDENT -->
<!-- if exactly one title is present, we go into single-item mode instead. -->

<xsl:template match="facet[@field='facet-category-student']">
	<!--
	<xsl:if test="count(group) &gt; 1 and not(count(/crossQueryResult/parameters/param[substring-after(@name, '-') = 'title']) = 1)">
	-->
		<!--<h2>Student Publications</h2>-->
		<h2>University Publications</h2>
		<ul><xsl:apply-templates/></ul>
</xsl:template>

<!-- FACET: FACET-CATEGORY-UNIVERSITY -->
<!-- if exactly one title is present, we go into single-item mode instead. -->

<xsl:template match="facet[@field='facet-category-university']">
	<!--
	<xsl:if test="count(group) &gt; 1 and not(count(/crossQueryResult/parameters/param[substring-after(@name, '-') = 'title']) = 1)">
	-->
		<h2>University Publications</h2>
		<ul><xsl:apply-templates/></ul>
</xsl:template>

<!-- FACET: FACET-DATE -->

<xsl:template match="facet[@field='facet-date']">
	<xsl:if test="count(group) &gt; 1 or /crossQueryResult/parameters/param[@name='f1-date']">
		<h2>Dates</h2>
		<ul>
			<xsl:apply-templates/>
			<xsl:if test="count(group) = 1 and /crossQueryResult/parameters/param[@name='f1-date']">
				<li>
					<a>
					<xsl:attribute name="href">
						<xsl:apply-templates select="/" mode="backurl">
							<xsl:with-param name="name" select="'f1-date'"/>
						</xsl:apply-templates>
					</xsl:attribute>
						&lt; any date
					</a>
				</li>
			</xsl:if>
		</ul>
	</xsl:if>
</xsl:template>

<!-- FACET: FACET-VOLUME -->

<xsl:template match="facet[@field='facet-volume']">
<xsl:if test="count(group) &gt; 1 or /crossQueryResult/parameters/param[@name='f1-volume']">
	<h2>Volumes</h2>
	<ul>
		<xsl:apply-templates/>
		<xsl:if test="count(group) = 1 and /crossQueryResult/parameters/param[@name='f1-volume']">
			<li>
				<a>
				<xsl:attribute name="href">
					<xsl:apply-templates select="/" mode="backurl">
						<xsl:with-param name="name" select="'f1-volume'"/>
					</xsl:apply-templates>
				</xsl:attribute>
					&lt; any volume
				</a>
			</li>
		</xsl:if>
	</ul>
</xsl:if>
</xsl:template>

<!-- URL MODE -->

<xsl:template match="*" mode="url">
<xsl:param name="name"/>
<xsl:param name="value"/>
<xsl:apply-templates mode="url">
	<xsl:with-param name="name" select="$name"/>
	<xsl:with-param name="value" select="$value"/>
</xsl:apply-templates>
</xsl:template>

<xsl:template match="/" mode="url">
<xsl:param name="name"/>
<xsl:param name="value"/>
/search?<xsl:apply-templates select="//param" mode="url"><xsl:with-param name="name" select="$name"/><xsl:with-param name="value" select="$value"/></xsl:apply-templates>&amp;<xsl:value-of select="concat($name, '=', $value)"/>
</xsl:template>

<xsl:template match="param" mode="url">
<xsl:param name="name"/>
<xsl:param name="value"/>
<xsl:if test="
	not(
		($name = 'f1-date' and @name = 'f1-date') or
		($name = 'f1-volume' and @name = 'f1-volume') or
		(substring-after($name, '-') = 'title' and substring-after(@name, '-') = 'title')
	)
">
	<xsl:if test="position() &gt; 1">&amp;</xsl:if>
	<xsl:value-of select="concat(@name, '=', @value)"/>
</xsl:if>
</xsl:template>

<!-- REMOVE URL COMPONENT -->

<xsl:template match="*" mode="backurl">
<xsl:param name="name"/>
<xsl:apply-templates mode="backurl"><xsl:with-param name="name" select="$name"/></xsl:apply-templates>
</xsl:template>

<xsl:template match="/" mode="backurl">
<xsl:param name="name"/>
/search?<xsl:apply-templates select="//param" mode="backurl"><xsl:with-param name="name" select="$name"/></xsl:apply-templates>
</xsl:template>

<xsl:template match="param" mode="backurl">
<xsl:param name="name"/>
<xsl:if test="
	not(
		($name = 'f1-date' and @name = 'f1-date') or
		($name = 'f1-volume' and @name = 'f1-volume') or
		(substring-after($name, '-') = 'title' and substring-after(@name, '-') = 'title')
	)
">
	<xsl:choose>
		<xsl:when test="position() = 1">?</xsl:when>
		<xsl:otherwise>&amp;</xsl:otherwise>
	</xsl:choose>
	<xsl:value-of select="concat(@name, '=', @value)"/>
</xsl:if>
</xsl:template>

</xsl:stylesheet>
